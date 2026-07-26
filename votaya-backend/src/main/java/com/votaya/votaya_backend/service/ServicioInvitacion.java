package com.votaya.votaya_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.votaya.votaya_backend.Excepciones.RecursoNoEncontradoExcepcion;
import com.votaya.votaya_backend.Excepciones.ReglaNegocioExcepcion;
import com.votaya.votaya_backend.Repository.InvitacionVotacionRepositorio;
import com.votaya.votaya_backend.Repository.UsuarioRepositorio;
import com.votaya.votaya_backend.Repository.VotacionRepositorio;
import com.votaya.votaya_backend.dto.InvitacionDTO;
import com.votaya.votaya_backend.enumeraciones.EstadoInvitacion;
import com.votaya.votaya_backend.enumeraciones.PrivacidadVotacion;
import com.votaya.votaya_backend.enumeraciones.RolUsuario;
import com.votaya.votaya_backend.model.InvitacionVotacion;
import com.votaya.votaya_backend.model.Usuario;
import com.votaya.votaya_backend.model.Votacion;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ServicioInvitacion {

    private final InvitacionVotacionRepositorio invitacionRepositorio;
    private final VotacionRepositorio votacionRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final ServicioUsuarioActual servicioUsuarioActual;

    @Transactional
    public InvitacionDTO.Respuesta invitar(
            Long idVotacion,
            Long idUsuario) {
        Usuario usuarioActual = servicioUsuarioActual.obtener();

        Votacion votacion = buscarVotacion(idVotacion);

        boolean propietario = votacion.getCreador()
                .getIdUsuario()
                .equals(usuarioActual.getIdUsuario());

        boolean administrador = usuarioActual.getRol() == RolUsuario.ADMINISTRADOR;

        if (!propietario && !administrador) {
            throw new AccessDeniedException(
                    "No puedes invitar personas a esta votación");
        }

        if (votacion.getPrivacidad() != PrivacidadVotacion.PRIVADA) {
            throw new ReglaNegocioExcepcion(
                    "Solo las votaciones privadas usan invitaciones");
        }

        if (invitacionRepositorio
                .existsByVotacionIdVotacionAndUsuarioIdUsuario(
                        idVotacion,
                        idUsuario)) {
            throw new ReglaNegocioExcepcion(
                    "El usuario ya fue invitado");
        }

        Usuario invitado = usuarioRepositorio
                .findById(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion(
                        "Usuario no encontrado"));

        InvitacionVotacion invitacion = InvitacionVotacion.builder()
                .votacion(votacion)
                .usuario(invitado)
                .estado(EstadoInvitacion.PENDIENTE)
                .build();

        invitacionRepositorio.save(invitacion);

        return convertir(invitacion);
    }

    @Transactional
    public InvitacionDTO.Respuesta responder(
            Long idInvitacion,
            InvitacionDTO.SolicitudRespuesta solicitud) {
        Usuario usuario = servicioUsuarioActual.obtener();

        InvitacionVotacion invitacion = invitacionRepositorio
                .findById(idInvitacion)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion(
                        "Invitación no encontrada"));

        if (!invitacion.getUsuario()
                .getIdUsuario()
                .equals(usuario.getIdUsuario())) {
            throw new AccessDeniedException(
                    "No puedes responder esta invitación");
        }

        if (solicitud.estado() != EstadoInvitacion.ACEPTADA
                && solicitud.estado() != EstadoInvitacion.RECHAZADA) {
            throw new ReglaNegocioExcepcion(
                    "Solo puedes aceptar o rechazar la invitación");
        }

        invitacion.setEstado(solicitud.estado());
        invitacion.setFechaRespuesta(
                LocalDateTime.now());

        invitacionRepositorio.save(invitacion);

        return convertir(invitacion);
    }

    private Votacion buscarVotacion(Long idVotacion) {
        return votacionRepositorio
                .findById(idVotacion)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion(
                        "Votación no encontrada"));
    }

    private InvitacionDTO.Respuesta convertir(
            InvitacionVotacion invitacion) {
        return new InvitacionDTO.Respuesta(
                invitacion.getIdInvitacion(),
                invitacion.getVotacion()
                        .getIdVotacion(),
                invitacion.getUsuario()
                        .getIdUsuario(),
                invitacion.getEstado());
    }
}