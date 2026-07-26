package com.votaya.votaya_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class CategoriaDTO {

    private CategoriaDTO() {
    }

    public record Solicitud(
            @NotBlank @Size(max = 80) String nombre,

            @Size(max = 250) String descripcion) {
    }

    public record Respuesta(
            Integer idCategoria,
            String nombre,
            String descripcion) {
    }
}