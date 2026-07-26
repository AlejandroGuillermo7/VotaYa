package com.votaya.votaya_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class RecuperacionDTO {

    private RecuperacionDTO() {
    }

    public record SolicitudToken(
            @NotBlank @Email String correo) {
    }

    public record RespuestaToken(
            String mensaje,
            String token) {
    }

    public record SolicitudRestablecer(
            @NotBlank String token,

            @NotBlank @Size(min = 8, max = 72) String nuevaContrasena) {
    }
}