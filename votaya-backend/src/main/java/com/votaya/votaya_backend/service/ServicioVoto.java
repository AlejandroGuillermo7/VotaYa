package com.votaya.votaya_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.votaya.votaya_backend.Excepciones.RecursoNoEncontradoExcepcion;
import com.votaya.votaya_backend.Excepciones.ReglaNegocioExcepcion;
import com.votaya.votaya_backend.Repository.InvitacionVotacionRepositorio;
import com.votaya.votaya_backend.Repository.OpcionVotacionRepositorio;
import com.votaya.votaya_backend.Repository.ParticipacionRepositorio;
import com.votaya.votaya_backend.Repository.VotacionRepositorio;
import com.votaya.votaya_backend.Repository.VotoOpcionRepositorio;
import com.votaya.votaya_backend.Repository.VotoRepositorio;
import com.votaya.votaya_backend.dto.VotoDTO;
import com.votaya.votaya_backend.enumeraciones.EstadoInvitacion;
import com.votaya.votaya_backend.enumeraciones.EstadoVotacion;
import com.votaya.votaya_backend.enumeraciones.PrivacidadVotacion;
import com.votaya.votaya_backend.enumeraciones.RolUsuario;
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
import java.security.*;
import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ServicioVoto {

    private final VotacionRepositorio votacionRepositorio;
    private final OpcionVotacionRepositorio opcionRepositorio;
    private final ParticipacionRepositorio participacionRepositorio;
    private final VotoRepositorio votoRepositorio;
    private final VotoOpcionRepositorio votoOpcionRepositorio;
    private final InvitacionVotacionRepositorio invitacionRepositorio;
    private final ServicioUsuarioActual servicioUsuarioActual;
    private final ServicioAuditoria servicioAuditoria;

    private final SecureRandom generadorSeguro = new SecureRandom();

    @Transactional
    public VotoDTO.RespuestaEmision emitir(
            Long idVotacion,
            VotoDTO.SolicitudEmitir solicitud) {
        Usuario usuario = servicioUsuarioActual.obtener();
        Votacion votacion = buscarVotacion(idVotacion);

        validarPuedeVotar(votacion, usuario);

        if (participacionRepositorio
                .existsByVotacionIdVotacionAndUsuarioIdUsuario(
                        idVotacion,
                        usuario.getIdUsuario())) {
            throw new ReglaNegocioExcepcion(
                    "Ya participaste en esta votación");
        }

        List<OpcionVotacion> opciones = validarOpciones(
                votacion,
                solicitud.idsOpciones());

        Participacion participacion = Participacion.builder()
                .votacion(votacion)
                .usuario(usuario)
                .fechaVoto(LocalDateTime.now())
                .build();

        participacionRepositorio.save(participacion);

        String tokenCambioOriginal = null;
        String tokenCambioHash = null;

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
                                : usuario)

                .folioPublico(UUID.randomUUID().toString())
                .tokenCambioHash(tokenCambioHash)
                .build();

        votoRepositorio.save(voto);

        guardarOpciones(
                voto,
                votacion,
                opciones);

        servicioAuditoria.registrar(
                usuario,
                "EMITIR_VOTO",
                "VOTACION",
                idVotacion,
                null);

        return new VotoDTO.RespuestaEmision(
                "Voto registrado correctamente",
                voto.getFolioPublico(),
                tokenCambioOriginal);
    }

    @Transactional
    public VotoDTO.RespuestaEmision cambiar(
            Long idVotacion,
            VotoDTO.SolicitudCambiar solicitud) {
        Usuario usuario = servicioUsuarioActual.obtener();
        Votacion votacion = buscarVotacion(idVotacion);

        validarActiva(votacion);

        if (!votacion.getPermiteCambioVoto()) {
            throw new ReglaNegocioExcepcion(
                    "Esta votación no permite cambiar el voto");
        }

        List<OpcionVotacion> nuevasOpciones = validarOpciones(
                votacion,
                solicitud.idsOpciones());

        Voto voto;

        if (votacion.getTipoVoto() == TipoVoto.IDENTIFICADO) {

            voto = votoRepositorio
                    .findByVotacionIdVotacionAndUsuarioIdUsuario(
                            idVotacion,
                            usuario.getIdUsuario())
                    .orElseThrow();

        } else {
            if (solicitud.tokenCambio() == null
                    || solicitud.tokenCambio().isBlank()) {
                throw new ReglaNegocioExcepcion(
                        "Debes enviar el token de cambio del voto anónimo");
            }

            String tokenHash = calcularHash(solicitud.tokenCambio());

            voto = votoRepositorio
                    .findByVotacionIdVotacionAndTokenCambioHash(
                            idVotacion,
                            tokenHash)
                    .orElseThrow(() -> new ReglaNegocioExcepcion(
                            "Token de cambio incorrecto"));
        }

        votoOpcionRepositorio
                .eliminarPorIdVoto(voto.getIdVoto());

        guardarOpciones(
                voto,
                votacion,
                nuevasOpciones);

        servicioAuditoria.registrar(
                usuario,
                "CAMBIAR_VOTO",
                "VOTACION",
                idVotacion,
                null);

        return new VotoDTO.RespuestaEmision(
                "Voto actualizado correctamente",
                voto.getFolioPublico(),
                null);
    }

    public VotoDTO.RespuestaResultados obtenerResultados(
            Long idVotacion) {
        Votacion votacion = buscarVotacion(idVotacion);

        validarAccesoResultados(votacion);

        long totalVotantes = votoRepositorio
                .countByVotacionIdVotacion(
                        idVotacion);

        long totalSelecciones = votoOpcionRepositorio
                .countByIdVotacion(idVotacion);

        List<VotoDTO.ResultadoOpcion> resultados = opcionRepositorio
                .obtenerResultados(idVotacion)
                .stream()
                .map(fila -> {
                    Long idOpcion = ((Number) fila[0]).longValue();

                    String nombre = String.valueOf(fila[1]);

                    long votos = ((Number) fila[2]).longValue();

                    double porcentaje = totalVotantes == 0
                            ? 0
                            : Math.round(
                                    votos
                                            * 10000.0
                                            / totalVotantes)
                                    / 100.0;

                    return new VotoDTO.ResultadoOpcion(
                            idOpcion,
                            nombre,
                            votos,
                            porcentaje);
                })
                .toList();

        return new VotoDTO.RespuestaResultados(
                votacion.getIdVotacion(),
                votacion.getTitulo(),
                totalVotantes,
                totalSelecciones,
                resultados);
    }

    @Transactional(readOnly = true)
    public List<VotoDTO.RespuestaParticipacion> listarMisParticipaciones() {

        Usuario usuario = servicioUsuarioActual.obtener();

        return participacionRepositorio
                .findByUsuarioIdUsuarioOrderByFechaVotoDesc(
                        usuario.getIdUsuario())
                .stream()
                .map(participacion -> new VotoDTO.RespuestaParticipacion(
                        participacion.getIdParticipacion(),
                        participacion.getVotacion()
                                .getIdVotacion(),
                        participacion.getVotacion()
                                .getTitulo(),
                        participacion.getVotacion()
                                .getTipoVoto(),
                        participacion.getFechaVoto()))
                .toList();
    }

    private void validarPuedeVotar(
            Votacion votacion,
            Usuario usuario) {
        validarActiva(votacion);

        if (votacion.getEdadMinima() != null) {
            int edad = Period.between(
                    usuario.getFechaNacimiento(),
                    LocalDate.now()).getYears();

            if (edad < votacion.getEdadMinima()) {
                throw new AccessDeniedException(
                        "No cumples con la edad mínima");
            }
        }

        if (votacion.getPrivacidad() == PrivacidadVotacion.PRIVADA) {

            boolean invitado = invitacionRepositorio
                    .existsByVotacionIdVotacionAndUsuarioIdUsuarioAndEstado(
                            votacion.getIdVotacion(),
                            usuario.getIdUsuario(),
                            EstadoInvitacion.ACEPTADA);

            boolean creador = votacion.getCreador()
                    .getIdUsuario()
                    .equals(usuario.getIdUsuario());

            boolean administrador = usuario.getRol() == RolUsuario.ADMINISTRADOR;

            if (!invitado
                    && !creador
                    && !administrador) {
                throw new AccessDeniedException(
                        "No tienes acceso a esta votación privada");
            }
        }
    }

    private void validarActiva(Votacion votacion) {
        LocalDateTime ahora = LocalDateTime.now();

        if (votacion.getEstado() == EstadoVotacion.BORRADOR) {
            throw new ReglaNegocioExcepcion(
                    "La votación todavía es un borrador");
        }

        if (votacion.getEstado() == EstadoVotacion.CANCELADA) {
            throw new ReglaNegocioExcepcion(
                    "La votación fue cancelada");
        }

        if (ahora.isBefore(votacion.getFechaInicio())) {
            throw new ReglaNegocioExcepcion(
                    "La votación todavía no comienza");
        }

        if (ahora.isAfter(votacion.getFechaFin())) {
            throw new ReglaNegocioExcepcion(
                    "La votación ya finalizó");
        }
    }

    private List<OpcionVotacion> validarOpciones(
            Votacion votacion,
            List<Long> idsOpciones) {
        List<Long> idsSinRepetidos = idsOpciones.stream()
                .distinct()
                .toList();

        if (idsSinRepetidos.size() != idsOpciones.size()) {
            throw new ReglaNegocioExcepcion(
                    "No puedes repetir opciones");
        }

        if (votacion.getTipoSeleccion() == TipoSeleccion.UNICA
                && idsOpciones.size() != 1) {
            throw new ReglaNegocioExcepcion(
                    "Solo puedes seleccionar una opción");
        }

        if (votacion.getTipoSeleccion() == TipoSeleccion.MULTIPLE
                && idsOpciones.size() > votacion.getMaxSelecciones()) {
            throw new ReglaNegocioExcepcion(
                    "Superaste el máximo de selecciones");
        }

        List<OpcionVotacion> opciones = opcionRepositorio
                .findByIdOpcionInAndVotacionIdVotacion(
                        idsOpciones,
                        votacion.getIdVotacion());

        if (opciones.size() != idsOpciones.size()) {
            throw new ReglaNegocioExcepcion(
                    "Una o más opciones no pertenecen a la votación");
        }

        return opciones;
    }

    private void guardarOpciones(
            Voto voto,
            Votacion votacion,
            List<OpcionVotacion> opciones) {
        for (OpcionVotacion opcion : opciones) {
            VotoOpcion votoOpcion = VotoOpcion.builder()
                    .id(
                            new VotoOpcionID(
                                    voto.getIdVoto(),
                                    opcion.getIdOpcion()))
                    .idVotacion(
                            votacion.getIdVotacion())
                    .build();

            votoOpcionRepositorio.save(votoOpcion);
        }
    }

    private void validarAccesoResultados(
            Votacion votacion) {
        if (votacion.getPrivacidad() == PrivacidadVotacion.PUBLICA) {
            return;
        }

        Usuario usuario = servicioUsuarioActual.obtener();

        boolean invitado = invitacionRepositorio
                .existsByVotacionIdVotacionAndUsuarioIdUsuarioAndEstado(
                        votacion.getIdVotacion(),
                        usuario.getIdUsuario(),
                        EstadoInvitacion.ACEPTADA);

        boolean creador = votacion.getCreador()
                .getIdUsuario()
                .equals(usuario.getIdUsuario());

        boolean administrador = usuario.getRol() == RolUsuario.ADMINISTRADOR;

        if (!invitado && !creador && !administrador) {
            throw new AccessDeniedException(
                    "No puedes consultar los resultados");
        }
    }

    private Votacion buscarVotacion(Long idVotacion) {
        return votacionRepositorio
                .findById(idVotacion)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion(
                        "Votación no encontrada"));
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
            MessageDigest resumen = MessageDigest.getInstance("SHA-256");

            byte[] hash = resumen.digest(
                    token.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(hash);

        } catch (NoSuchAlgorithmException excepcion) {
            throw new IllegalStateException(
                    "No fue posible generar el hash",
                    excepcion);
        }
    }
}