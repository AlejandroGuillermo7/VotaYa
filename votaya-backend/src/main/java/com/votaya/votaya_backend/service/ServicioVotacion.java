package com.votaya.votaya_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.votaya.votaya_backend.Repository.OpcionVotacionRepositorio;
import com.votaya.votaya_backend.dto.VotacionDTO;
import com.votaya.votaya_backend.enumeraciones.EstadoInvitacion;
import com.votaya.votaya_backend.enumeraciones.EstadoVotacion;
import com.votaya.votaya_backend.enumeraciones.PrivacidadVotacion;
import com.votaya.votaya_backend.enumeraciones.RolUsuario;
import com.votaya.votaya_backend.enumeraciones.TipoSeleccion;
import com.votaya.votaya_backend.model.*;
import com.votaya.votaya_backend.Excepciones.RecursoNoEncontradoExcepcion;
import com.votaya.votaya_backend.Excepciones.ReglaNegocioExcepcion;
import com.votaya.votaya_backend.Repository.*;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ServicioVotacion {

    private final VotacionRepositorio votacionRepositorio;
    private final OpcionVotacionRepositorio opcionRepositorio;
    private final CategoriaRepositorio categoriaRepositorio;
    private final VotoRepositorio votoRepositorio;
    private final InvitacionVotacionRepositorio invitacionRepositorio;
    private final ServicioUsuarioActual servicioUsuarioActual;
    private final ServicioAuditoria servicioAuditoria;

    @Transactional
    public VotacionDTO.Respuesta crear(
            VotacionDTO.SolicitudGuardar solicitud) {
        Usuario creador = servicioUsuarioActual.obtener();

        validarSolicitud(solicitud, true);

        Categoria categoria = obtenerCategoria(solicitud.idCategoria());

        Votacion votacion = Votacion.builder()
                .creador(creador)
                .categoria(categoria)
                .titulo(solicitud.titulo().trim())
                .descripcion(limpiar(solicitud.descripcion()))
                .imagenPortadaUrl(
                        limpiar(solicitud.imagenPortadaUrl()))
                .fechaInicio(solicitud.fechaInicio())
                .fechaFin(solicitud.fechaFin())
                .estado(
                        determinarEstadoInicial(
                                solicitud.estado(),
                                solicitud.fechaInicio(),
                                solicitud.fechaFin()))
                .privacidad(solicitud.privacidad())
                .tipoVoto(solicitud.tipoVoto())
                .tipoSeleccion(solicitud.tipoSeleccion())
                .maxSelecciones(solicitud.maxSelecciones())
                .tipoGrafica(solicitud.tipoGrafica())
                .edadMinima(solicitud.edadMinima())
                .comentariosPermitidos(
                        solicitud.comentariosPermitidos())
                .permiteCambioVoto(
                        solicitud.permiteCambioVoto())
                .build();

        votacionRepositorio.save(votacion);

        guardarOpciones(
                votacion,
                solicitud.opciones());

        servicioAuditoria.registrar(
                creador,
                "CREAR_VOTACION",
                "VOTACION",
                votacion.getIdVotacion(),
                null);

        return convertir(votacion);
    }

    public List<VotacionDTO.Respuesta> listarDisponibles() {
        Usuario usuario = servicioUsuarioActual.obtener();
        LocalDateTime ahora = LocalDateTime.now();

        List<Votacion> votaciones = new ArrayList<>(
                votacionRepositorio.buscarDisponibles(
                        PrivacidadVotacion.PUBLICA,
                        List.of(
                                EstadoVotacion.BORRADOR,
                                EstadoVotacion.CANCELADA),
                        ahora));

        invitacionRepositorio
                .findByUsuarioIdUsuarioAndEstado(
                        usuario.getIdUsuario(),
                        EstadoInvitacion.ACEPTADA)
                .stream()
                .map(InvitacionVotacion::getVotacion)
                .filter(this::estaDisponible)
                .forEach(votaciones::add);

        return votaciones.stream()
                .collect(
                        java.util.stream.Collectors.toMap(
                                Votacion::getIdVotacion,
                                votacion -> votacion,
                                (primera, segunda) -> primera))
                .values()
                .stream()
                .map(this::convertir)
                .toList();
    }

    public List<VotacionDTO.Respuesta> listarMias() {
        Usuario usuario = servicioUsuarioActual.obtener();

        return votacionRepositorio
                .findByCreadorIdUsuarioOrderByFechaCreacionDesc(
                        usuario.getIdUsuario())
                .stream()
                .map(this::convertir)
                .toList();
    }

    public VotacionDTO.Respuesta obtenerDetalle(
            Long idVotacion) {
        Votacion votacion = buscar(idVotacion);

        validarAccesoLectura(votacion);

        return convertir(votacion);
    }

    @Transactional
    public VotacionDTO.Respuesta actualizar(
            Long idVotacion,
            VotacionDTO.SolicitudGuardar solicitud) {
        Usuario usuario = servicioUsuarioActual.obtener();
        Votacion votacion = buscar(idVotacion);

        validarPropietarioOAdministrador(votacion, usuario);
        validarSolicitud(solicitud, false);

        votacion.setCategoria(
                obtenerCategoria(solicitud.idCategoria()));
        votacion.setTitulo(solicitud.titulo().trim());
        votacion.setDescripcion(
                limpiar(solicitud.descripcion()));
        votacion.setImagenPortadaUrl(
                limpiar(solicitud.imagenPortadaUrl()));
        votacion.setFechaInicio(solicitud.fechaInicio());
        votacion.setFechaFin(solicitud.fechaFin());
        votacion.setPrivacidad(solicitud.privacidad());
        votacion.setTipoVoto(solicitud.tipoVoto());
        votacion.setTipoSeleccion(
                solicitud.tipoSeleccion());
        votacion.setMaxSelecciones(
                solicitud.maxSelecciones());
        votacion.setTipoGrafica(
                solicitud.tipoGrafica());
        votacion.setEdadMinima(
                solicitud.edadMinima());
        votacion.setComentariosPermitidos(
                solicitud.comentariosPermitidos());
        votacion.setPermiteCambioVoto(
                solicitud.permiteCambioVoto());

        if (solicitud.estado() != null) {
            votacion.setEstado(
                    determinarEstadoInicial(
                            solicitud.estado(),
                            solicitud.fechaInicio(),
                            solicitud.fechaFin()));
        }

        votacionRepositorio.save(votacion);

        if (solicitud.opciones() != null
                && !solicitud.opciones().isEmpty()) {

            if (votoRepositorio
                    .countByVotacionIdVotacion(idVotacion) > 0) {
                throw new ReglaNegocioExcepcion(
                        "No puedes modificar las opciones porque la votación ya tiene votos");
            }

            opcionRepositorio
                    .deleteByVotacionIdVotacion(idVotacion);

            guardarOpciones(
                    votacion,
                    solicitud.opciones());
        }

        servicioAuditoria.registrar(
                usuario,
                "ACTUALIZAR_VOTACION",
                "VOTACION",
                idVotacion,
                null);

        return convertir(votacion);
    }

    @Transactional
    public void cancelar(Long idVotacion) {
        Usuario usuario = servicioUsuarioActual.obtener();
        Votacion votacion = buscar(idVotacion);

        validarPropietarioOAdministrador(votacion, usuario);

        votacion.setEstado(EstadoVotacion.CANCELADA);
        votacionRepositorio.save(votacion);
    }

    @Transactional
    public void eliminar(Long idVotacion) {
        Usuario usuario = servicioUsuarioActual.obtener();
        Votacion votacion = buscar(idVotacion);

        validarPropietarioOAdministrador(votacion, usuario);

        long votos = votoRepositorio.countByVotacionIdVotacion(
                idVotacion);

        if (votos > 0) {
            throw new ReglaNegocioExcepcion(
                    "La votación ya tiene votos; debes cancelarla en lugar de eliminarla");
        }

        votacionRepositorio.delete(votacion);
    }

    public Votacion buscar(Long idVotacion) {
        return votacionRepositorio
                .findById(idVotacion)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion(
                        "Votación no encontrada"));
    }

    public boolean puedeAdministrar(
            Votacion votacion,
            Usuario usuario) {
        return votacion.getCreador()
                .getIdUsuario()
                .equals(usuario.getIdUsuario())
                || usuario.getRol() == RolUsuario.ADMINISTRADOR;
    }

    private void validarSolicitud(
            VotacionDTO.SolicitudGuardar solicitud,
            boolean requiereOpciones) {
        if (!solicitud.fechaFin()
                .isAfter(solicitud.fechaInicio())) {
            throw new ReglaNegocioExcepcion(
                    "La fecha final debe ser posterior a la fecha inicial");
        }

        if (requiereOpciones
                && (solicitud.opciones() == null
                        || solicitud.opciones().size() < 2)) {
            throw new ReglaNegocioExcepcion(
                    "Debes agregar al menos dos opciones");
        }

        if (solicitud.tipoSeleccion() == TipoSeleccion.UNICA
                && solicitud.maxSelecciones() != 1) {
            throw new ReglaNegocioExcepcion(
                    "Una votación de selección única debe permitir una sola opción");
        }

        if (solicitud.opciones() != null
                && solicitud.maxSelecciones() > solicitud.opciones().size()) {
            throw new ReglaNegocioExcepcion(
                    "El máximo de selecciones no puede superar el número de opciones");
        }
    }

    private void guardarOpciones(
            Votacion votacion,
            List<VotacionDTO.SolicitudOpcion> solicitudes) {
        if (solicitudes == null || solicitudes.size() < 2) {
            throw new ReglaNegocioExcepcion(
                    "Debes agregar al menos dos opciones");
        }

        Set<String> nombres = new HashSet<>();

        for (int indice = 0; indice < solicitudes.size(); indice++) {

            VotacionDTO.SolicitudOpcion solicitud = solicitudes.get(indice);

            String nombre = solicitud.nombre().trim();

            if (!nombres.add(nombre.toLowerCase())) {
                throw new ReglaNegocioExcepcion(
                        "No puedes repetir opciones");
            }

            OpcionVotacion opcion = OpcionVotacion.builder()
                    .votacion(votacion)
                    .nombre(nombre)
                    .imagenUrl(
                            limpiar(solicitud.imagenUrl()))
                    .ordenVisual(indice + 1)
                    .build();

            opcionRepositorio.save(opcion);
        }
    }

    private void validarAccesoLectura(
            Votacion votacion) {
        if (votacion.getPrivacidad() == PrivacidadVotacion.PUBLICA) {
            return;
        }

        Usuario usuario = servicioUsuarioActual.obtener();

        if (puedeAdministrar(votacion, usuario)) {
            return;
        }

        boolean invitado = invitacionRepositorio
                .existsByVotacionIdVotacionAndUsuarioIdUsuarioAndEstado(
                        votacion.getIdVotacion(),
                        usuario.getIdUsuario(),
                        EstadoInvitacion.ACEPTADA);

        if (!invitado) {
            throw new AccessDeniedException(
                    "No tienes acceso a esta votación privada");
        }
    }

    private void validarPropietarioOAdministrador(
            Votacion votacion,
            Usuario usuario) {
        if (!puedeAdministrar(votacion, usuario)) {
            throw new AccessDeniedException(
                    "No puedes modificar esta votación");
        }
    }

    private Categoria obtenerCategoria(
            Integer idCategoria) {
        if (idCategoria == null) {
            return null;
        }

        return categoriaRepositorio
                .findById(idCategoria)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion(
                        "Categoría no encontrada"));
    }

    private EstadoVotacion determinarEstadoInicial(
            EstadoVotacion solicitado,
            LocalDateTime inicio,
            LocalDateTime fin) {
        if (solicitado == null
                || solicitado == EstadoVotacion.BORRADOR) {
            return EstadoVotacion.BORRADOR;
        }

        if (solicitado == EstadoVotacion.CANCELADA) {
            return EstadoVotacion.CANCELADA;
        }

        LocalDateTime ahora = LocalDateTime.now();

        if (ahora.isBefore(inicio)) {
            return EstadoVotacion.PROGRAMADA;
        }

        if (ahora.isAfter(fin)) {
            return EstadoVotacion.FINALIZADA;
        }

        return EstadoVotacion.ACTIVA;
    }

    private EstadoVotacion obtenerEstadoActual(
            Votacion votacion) {
        if (votacion.getEstado() == EstadoVotacion.BORRADOR
                || votacion.getEstado() == EstadoVotacion.CANCELADA) {
            return votacion.getEstado();
        }

        LocalDateTime ahora = LocalDateTime.now();

        if (ahora.isBefore(votacion.getFechaInicio())) {
            return EstadoVotacion.PROGRAMADA;
        }

        if (ahora.isAfter(votacion.getFechaFin())) {
            return EstadoVotacion.FINALIZADA;
        }

        return EstadoVotacion.ACTIVA;
    }

    private boolean estaDisponible(Votacion votacion) {
        return obtenerEstadoActual(votacion) == EstadoVotacion.ACTIVA;
    }

    private VotacionDTO.Respuesta convertir(
            Votacion votacion) {
        List<VotacionDTO.RespuestaOpcion> opciones = opcionRepositorio
                .findByVotacionIdVotacionOrderByOrdenVisualAsc(
                        votacion.getIdVotacion())
                .stream()
                .map(opcion -> new VotacionDTO.RespuestaOpcion(
                        opcion.getIdOpcion(),
                        opcion.getNombre(),
                        opcion.getImagenUrl(),
                        opcion.getOrdenVisual()))
                .toList();

        String nombreCreador = votacion.getCreador().getNombres()
                + " "
                + votacion.getCreador()
                        .getApellidoPaterno();

        return new VotacionDTO.Respuesta(
                votacion.getIdVotacion(),
                votacion.getCreador().getIdUsuario(),
                nombreCreador,
                votacion.getCategoria() == null
                        ? null
                        : votacion.getCategoria()
                                .getIdCategoria(),
                votacion.getCategoria() == null
                        ? null
                        : votacion.getCategoria().getNombre(),
                votacion.getTitulo(),
                votacion.getDescripcion(),
                votacion.getImagenPortadaUrl(),
                votacion.getFechaInicio(),
                votacion.getFechaFin(),
                obtenerEstadoActual(votacion),
                votacion.getPrivacidad(),
                votacion.getTipoVoto(),
                votacion.getTipoSeleccion(),
                votacion.getMaxSelecciones(),
                votacion.getTipoGrafica(),
                votacion.getEdadMinima(),
                votacion.getComentariosPermitidos(),
                votacion.getPermiteCambioVoto(),
                votoRepositorio
                        .countByVotacionIdVotacion(
                                votacion.getIdVotacion()),
                opciones);
    }

    private String limpiar(String valor) {
        return valor == null || valor.isBlank()
                ? null
                : valor.trim();
    }
}