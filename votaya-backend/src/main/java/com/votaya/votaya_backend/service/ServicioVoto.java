package com.votaya.votaya_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.votaya.votaya_backend.Excepciones.RecursoNoEncontradoExcepcion;
import com.votaya.votaya_backend.Excepciones.ReglaNegocioExcepcion;
import com.votaya.votaya_backend.Repository.OpcionVotacionRepositorio;
import com.votaya.votaya_backend.Repository.ParticipacionRepositorio;
import com.votaya.votaya_backend.Repository.VotacionRepositorio;
import com.votaya.votaya_backend.Repository.VotoOpcionRepositorio;
import com.votaya.votaya_backend.Repository.VotoRepositorio;
import com.votaya.votaya_backend.dto.VotoDTO;
import com.votaya.votaya_backend.enumeraciones.EstadoVotacion;
import com.votaya.votaya_backend.enumeraciones.TipoSeleccion;
import com.votaya.votaya_backend.enumeraciones.TipoVoto;
import com.votaya.votaya_backend.model.OpcionVotacion;
import com.votaya.votaya_backend.model.Participacion;
import com.votaya.votaya_backend.model.Usuario;
import com.votaya.votaya_backend.model.Votacion;
import com.votaya.votaya_backend.model.Voto;
import com.votaya.votaya_backend.model.VotoOpcion;
import com.votaya.votaya_backend.model.VotoOpcionID;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ServicioVoto {

    private final VotacionRepositorio votacionRepositorio;
    private final OpcionVotacionRepositorio opcionRepositorio;
    private final ParticipacionRepositorio participacionRepositorio;
    private final VotoRepositorio votoRepositorio;
    private final VotoOpcionRepositorio votoOpcionRepositorio;
    private final ServicioUsuarioActual servicioUsuarioActual;
    private final ServicioAuditoria servicioAuditoria;

    private final SecureRandom generadorSeguro = new SecureRandom();

    @Transactional
    public VotoDTO.RespuestaEmision emitir(
            Long idVotacion,
            VotoDTO.SolicitudEmitir solicitud
    ) {
        Usuario usuario = servicioUsuarioActual.obtener();
        Votacion votacion = buscarVotacion(idVotacion);

        /*
         * Para este proyecto de prueba, una elección pública o privada
         * puede abrirse y votarse con el enlace. Solo se valida sesión,
         * estado, fechas y edad mínima.
         */
        validarPuedeVotar(votacion, usuario);

        if (participacionRepositorio
                .existsByVotacionIdVotacionAndUsuarioIdUsuario(
                        idVotacion,
                        usuario.getIdUsuario()
                )) {
            throw new ReglaNegocioExcepcion(
                    "Ya participaste en esta votación"
            );
        }

        List<OpcionVotacion> opciones = validarOpciones(
                votacion,
                solicitud.idsOpciones()
        );

        Participacion participacion = Participacion.builder()
                .votacion(votacion)
                .usuario(usuario)
                .fechaVoto(LocalDateTime.now())
                .build();

        participacionRepositorio.save(participacion);

        String tokenCambioOriginal = null;
        String tokenCambioHash = null;

        /*
         * El token original se entrega una sola vez al frontend.
         * En MySQL únicamente se guarda su SHA-256.
         */
        if (votacion.getTipoVoto() == TipoVoto.ANONIMO
                && votacion.getPermiteCambioVoto()) {
            tokenCambioOriginal = generarTokenSeguro();
            tokenCambioHash = calcularHash(tokenCambioOriginal);
        }

        Voto voto = Voto.builder()
                .votacion(votacion)
                .usuario(
                        votacion.getTipoVoto() == TipoVoto.ANONIMO
                                ? null
                                : usuario
                )
                .folioPublico(UUID.randomUUID().toString())
                .tokenCambioHash(tokenCambioHash)
                .build();

        votoRepositorio.save(voto);

        guardarOpciones(
                voto,
                votacion,
                opciones
        );

        servicioAuditoria.registrar(
                usuario,
                "EMITIR_VOTO",
                "VOTACION",
                idVotacion,
                null
        );

        return new VotoDTO.RespuestaEmision(
                "Voto registrado correctamente",
                voto.getFolioPublico(),
                tokenCambioOriginal
        );
    }

    @Transactional
    public VotoDTO.RespuestaEmision cambiar(
            Long idVotacion,
            VotoDTO.SolicitudCambiar solicitud
    ) {
        Usuario usuario = servicioUsuarioActual.obtener();
        Votacion votacion = buscarVotacion(idVotacion);

        validarActiva(votacion);

        if (!votacion.getPermiteCambioVoto()) {
            throw new ReglaNegocioExcepcion(
                    "Esta votación no permite cambiar el voto"
            );
        }

        /*
         * La participación sí conserva id_usuario incluso cuando el voto
         * es anónimo. Esto confirma que la cuenta realmente participó.
         */
        boolean participo = participacionRepositorio
                .existsByVotacionIdVotacionAndUsuarioIdUsuario(
                        idVotacion,
                        usuario.getIdUsuario()
                );

        if (!participo) {
            throw new ReglaNegocioExcepcion(
                    "No has participado en esta votación"
            );
        }

        List<OpcionVotacion> nuevasOpciones = validarOpciones(
                votacion,
                solicitud.idsOpciones()
        );

        /*
         * CORRECCIÓN PRINCIPAL:
         *
         * Ya no se decide cómo buscar el voto únicamente usando
         * votacion.tipoVoto.
         *
         * 1. Primero se intenta encontrar un voto identificado
         *    relacionado con la cuenta.
         * 2. Si no existe, se trata como voto anónimo y se busca
         *    mediante el hash del token de cambio.
         *
         * Así nunca se ejecuta un orElseThrow() vacío y los votos
         * anónimos, cuyo id_usuario es NULL, sí pueden localizarse.
         */
        Voto voto = buscarVotoParaCambio(
                idVotacion,
                usuario,
                solicitud.tokenCambio()
        );

        votoOpcionRepositorio
                .eliminarPorIdVoto(voto.getIdVoto());

        guardarOpciones(
                voto,
                votacion,
                nuevasOpciones
        );

        servicioAuditoria.registrar(
                usuario,
                "CAMBIAR_VOTO",
                "VOTACION",
                idVotacion,
                null
        );

        return new VotoDTO.RespuestaEmision(
                "Voto actualizado correctamente",
                voto.getFolioPublico(),
                null
        );
    }

    @Transactional(readOnly = true)
    public VotoDTO.RespuestaResultados obtenerResultados(
            Long idVotacion
    ) {
        Votacion votacion = buscarVotacion(idVotacion);

        /*
         * Para la versión de prueba, los resultados se consultan
         * mediante el enlace sin distinguir PUBLICA o PRIVADA.
         */

        long totalVotantes = votoRepositorio
                .countByVotacionIdVotacion(idVotacion);

        long totalSelecciones = votoOpcionRepositorio
                .countByIdVotacion(idVotacion);

        List<VotoDTO.ResultadoOpcion> resultados = opcionRepositorio
                .obtenerResultados(idVotacion)
                .stream()
                .map(fila -> {
                    Long idOpcion =
                            ((Number) fila[0]).longValue();

                    String nombre =
                            String.valueOf(fila[1]);

                    long votos =
                            ((Number) fila[2]).longValue();

                    double porcentaje =
                            totalVotantes == 0
                                    ? 0
                                    : Math.round(
                                            votos
                                                    * 10000.0
                                                    / totalVotantes
                                    ) / 100.0;

                    return new VotoDTO.ResultadoOpcion(
                            idOpcion,
                            nombre,
                            votos,
                            porcentaje
                    );
                })
                .toList();

        return new VotoDTO.RespuestaResultados(
                votacion.getIdVotacion(),
                votacion.getTitulo(),
                totalVotantes,
                totalSelecciones,
                resultados
        );
    }

    @Transactional(readOnly = true)
    public List<VotoDTO.RespuestaParticipacion>
    listarMisParticipaciones() {

        Usuario usuario = servicioUsuarioActual.obtener();

        return participacionRepositorio
                .findByUsuarioIdUsuarioOrderByFechaVotoDesc(
                        usuario.getIdUsuario()
                )
                .stream()
                .map(participacion ->
                        new VotoDTO.RespuestaParticipacion(
                                participacion.getIdParticipacion(),
                                participacion
                                        .getVotacion()
                                        .getIdVotacion(),
                                participacion
                                        .getVotacion()
                                        .getTitulo(),
                                participacion
                                        .getVotacion()
                                        .getTipoVoto(),
                                participacion.getFechaVoto()
                        )
                )
                .toList();
    }

    private Voto buscarVotoParaCambio(
            Long idVotacion,
            Usuario usuario,
            String tokenCambio
    ) {
        Optional<Voto> votoIdentificado = votoRepositorio
                .findByVotacionIdVotacionAndUsuarioIdUsuario(
                        idVotacion,
                        usuario.getIdUsuario()
                );

        if (votoIdentificado.isPresent()) {
            return votoIdentificado.get();
        }

        /*
         * Si no existe un voto ligado al usuario, entonces el voto
         * fue almacenado como anónimo y tiene id_usuario = NULL.
         */
        if (tokenCambio == null || tokenCambio.isBlank()) {
            throw new ReglaNegocioExcepcion(
                    "Debes enviar el token de cambio del voto anónimo"
            );
        }

        String tokenCambioHash =
                calcularHash(tokenCambio.trim());

        return votoRepositorio
                .findByVotacionIdVotacionAndTokenCambioHash(
                        idVotacion,
                        tokenCambioHash
                )
                .orElseThrow(() ->
                        new ReglaNegocioExcepcion(
                                "El token de cambio del voto anónimo no es válido"
                        )
                );
    }

    private void validarPuedeVotar(
            Votacion votacion,
            Usuario usuario
    ) {
        validarActiva(votacion);

        if (votacion.getEdadMinima() != null) {
            int edad = Period.between(
                    usuario.getFechaNacimiento(),
                    LocalDate.now()
            ).getYears();

            if (edad < votacion.getEdadMinima()) {
                throw new AccessDeniedException(
                        "No cumples con la edad mínima"
                );
            }
        }

        /*
         * No se valida invitación:
         * pública o privada, quien tenga el enlace y una sesión
         * iniciada puede participar.
         */
    }

    private void validarActiva(Votacion votacion) {
        LocalDateTime ahora = LocalDateTime.now();

        if (votacion.getEstado() == EstadoVotacion.BORRADOR) {
            throw new ReglaNegocioExcepcion(
                    "La votación todavía es un borrador"
            );
        }

        if (votacion.getEstado() == EstadoVotacion.CANCELADA) {
            throw new ReglaNegocioExcepcion(
                    "La votación fue cancelada"
            );
        }

        if (ahora.isBefore(votacion.getFechaInicio())) {
            throw new ReglaNegocioExcepcion(
                    "La votación todavía no comienza"
            );
        }

        if (ahora.isAfter(votacion.getFechaFin())) {
            throw new ReglaNegocioExcepcion(
                    "La votación ya finalizó"
            );
        }
    }

    private List<OpcionVotacion> validarOpciones(
            Votacion votacion,
            List<Long> idsOpciones
    ) {
        if (idsOpciones == null || idsOpciones.isEmpty()) {
            throw new ReglaNegocioExcepcion(
                    "Debes seleccionar al menos una opción"
            );
        }

        List<Long> idsSinRepetidos = idsOpciones
                .stream()
                .distinct()
                .toList();

        if (idsSinRepetidos.size() != idsOpciones.size()) {
            throw new ReglaNegocioExcepcion(
                    "No puedes repetir opciones"
            );
        }

        if (votacion.getTipoSeleccion() == TipoSeleccion.UNICA
                && idsOpciones.size() != 1) {
            throw new ReglaNegocioExcepcion(
                    "Solo puedes seleccionar una opción"
            );
        }

        if (votacion.getTipoSeleccion() == TipoSeleccion.MULTIPLE
                && idsOpciones.size()
                > votacion.getMaxSelecciones()) {
            throw new ReglaNegocioExcepcion(
                    "Superaste el máximo de selecciones"
            );
        }

        List<OpcionVotacion> opciones = opcionRepositorio
                .findByIdOpcionInAndVotacionIdVotacion(
                        idsOpciones,
                        votacion.getIdVotacion()
                );

        if (opciones.size() != idsOpciones.size()) {
            throw new ReglaNegocioExcepcion(
                    "Una o más opciones no pertenecen a la votación"
            );
        }

        return opciones;
    }

    private void guardarOpciones(
            Voto voto,
            Votacion votacion,
            List<OpcionVotacion> opciones
    ) {
        for (OpcionVotacion opcion : opciones) {
            VotoOpcion votoOpcion = VotoOpcion.builder()
                    .id(
                            new VotoOpcionID(
                                    voto.getIdVoto(),
                                    opcion.getIdOpcion()
                            )
                    )
                    .idVotacion(
                            votacion.getIdVotacion()
                    )
                    .build();

            votoOpcionRepositorio.save(votoOpcion);
        }
    }

    private Votacion buscarVotacion(Long idVotacion) {
        return votacionRepositorio
                .findById(idVotacion)
                .orElseThrow(() ->
                        new RecursoNoEncontradoExcepcion(
                                "Votación no encontrada"
                        )
                );
    }

    private String generarTokenSeguro() {
        byte[] bytes = new byte[32];
        generadorSeguro.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    private String calcularHash(String token) {
        try {
            MessageDigest resumen =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = resumen.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);

        } catch (NoSuchAlgorithmException excepcion) {
            throw new IllegalStateException(
                    "No fue posible generar el hash",
                    excepcion
            );
        }
    }
}