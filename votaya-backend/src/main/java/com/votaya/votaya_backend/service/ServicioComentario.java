package com.votaya.votaya_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.votaya.votaya_backend.Excepciones.RecursoNoEncontradoExcepcion;
import com.votaya.votaya_backend.Excepciones.ReglaNegocioExcepcion;
import com.votaya.votaya_backend.Repository.ComentarioRepositorio;
import com.votaya.votaya_backend.Repository.VotacionRepositorio;
import com.votaya.votaya_backend.dto.ComentarioDTO;
import com.votaya.votaya_backend.model.Comentario;
import com.votaya.votaya_backend.model.Usuario;
import com.votaya.votaya_backend.model.Votacion;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicioComentario {

    private final ComentarioRepositorio comentarioRepositorio;
    private final VotacionRepositorio votacionRepositorio;
    private final ServicioUsuarioActual servicioUsuarioActual;

    @Transactional
    public ComentarioDTO.Respuesta crear(
            Long idVotacion,
            ComentarioDTO.Solicitud solicitud) {
        Usuario usuario = servicioUsuarioActual.obtener();

        Votacion votacion = votacionRepositorio
                .findById(idVotacion)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion(
                        "Votación no encontrada"));

        if (!votacion.getComentariosPermitidos()) {
            throw new ReglaNegocioExcepcion(
                    "Esta votación no permite comentarios");
        }

        Comentario comentario = Comentario.builder()
                .votacion(votacion)
                .usuario(usuario)
                .contenido(
                        solicitud.contenido().trim())
                .build();

        comentarioRepositorio.save(comentario);

        return convertir(comentario);
    }

    public List<ComentarioDTO.Respuesta> listar(
            Long idVotacion) {
        return comentarioRepositorio
                .findByVotacionIdVotacionOrderByFechaCreacionDesc(
                        idVotacion)
                .stream()
                .map(this::convertir)
                .toList();
    }

    private ComentarioDTO.Respuesta convertir(
            Comentario comentario) {
        Usuario usuario = comentario.getUsuario();

        return new ComentarioDTO.Respuesta(
                comentario.getIdComentario(),
                usuario.getIdUsuario(),
                usuario.getNombres()
                        + " "
                        + usuario.getApellidoPaterno(),
                comentario.getContenido(),
                comentario.getFechaCreacion());
    }
}