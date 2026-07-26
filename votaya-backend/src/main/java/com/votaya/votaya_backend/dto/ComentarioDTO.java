package com.votaya.votaya_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class ComentarioDTO {

    private ComentarioDTO() {
    }

    public record Solicitud(
            @NotBlank @Size(max = 1000) String contenido) {
    }

    public record Respuesta(
            Long idComentario,
            Long idUsuario,
            String nombreUsuario,
            String contenido,
            LocalDateTime fechaCreacion) {
    }
}