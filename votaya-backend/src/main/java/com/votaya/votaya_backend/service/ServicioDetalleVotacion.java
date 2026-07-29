package com.votaya.votaya_backend.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.votaya.votaya_backend.Repository.DetalleVotacionRepositorio;
import com.votaya.votaya_backend.Repository.VotoRepositorio;
import com.votaya.votaya_backend.dto.DetalleParticipanteProyeccion;
import com.votaya.votaya_backend.dto.DetalleVotacionDTO;
import com.votaya.votaya_backend.model.Usuario;
import com.votaya.votaya_backend.model.Votacion;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ServicioDetalleVotacion {

    private final DetalleVotacionRepositorio detalleVotacionRepositorio;
    private final VotoRepositorio votoRepositorio;
    private final ServicioVotacion servicioVotacion;
    private final ServicioUsuarioActual servicioUsuarioActual;

    @Transactional(readOnly = true)
    public DetalleVotacionDTO.RespuestaParticipantes obtenerParticipantes(
            Long idVotacion
    ) {
        Usuario usuarioActual = servicioUsuarioActual.obtener();
        Votacion votacion = servicioVotacion.buscar(idVotacion);

        if (!servicioVotacion.puedeAdministrar(votacion, usuarioActual)) {
            throw new AccessDeniedException(
                    "Solo el creador o un administrador puede consultar los participantes"
            );
        }

        boolean esAnonima = "ANONIMO".equals(votacion.getTipoVoto().name());

        /*
         * En una elección anónima jamás se consultan ni se devuelven
         * nombres, correos, fotografías o relaciones usuario-opción.
         * Únicamente se devuelve el total agregado de votos.
         */
        if (esAnonima) {
            long totalVotos = votoRepositorio.countByVotacionIdVotacion(
                    idVotacion
            );

            return new DetalleVotacionDTO.RespuestaParticipantes(
                    idVotacion,
                    votacion.getTipoVoto().name(),
                    true,
                    Math.toIntExact(totalVotos),
                    List.of()
            );
        }

        List<DetalleVotacionDTO.Participante> participantes =
                detalleVotacionRepositorio
                        .obtenerVotosIdentificados(idVotacion)
                        .stream()
                        .map(this::convertir)
                        .toList();

        return new DetalleVotacionDTO.RespuestaParticipantes(
                idVotacion,
                votacion.getTipoVoto().name(),
                false,
                participantes.size(),
                participantes
        );
    }

    private DetalleVotacionDTO.Participante convertir(
            DetalleParticipanteProyeccion fila
    ) {
        return new DetalleVotacionDTO.Participante(
                fila.getIdUsuario(),
                fila.getNombreCompleto(),
                fila.getCorreo(),
                fila.getFotoUrl(),
                fila.getFechaVoto(),
                fila.getOpcionSeleccionada()
        );
    }
}