package com.votaya.votaya_backend.dto;

import java.time.LocalDate;

import com.votaya.votaya_backend.enumeraciones.RolUsuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

public final class AutenticacionDTO {

    private AutenticacionDTO() {
    }

    public record SolicitudRegistro(
            @NotBlank
            @Size(max = 100)
            String nombres,

            @NotBlank
            @Size(max = 80)
            String apellidoPaterno,

            @Size(max = 80)
            String apellidoMaterno,

            @NotNull
            @Past
            LocalDate fechaNacimiento,

            @NotBlank
            @Email
            @Size(max = 150)
            String correo,

            @NotBlank
            @Size(min = 6, max = 72)
            String contrasena,

            String fotoUrl
    ) {
    }

    public record SolicitudLogin(
            @NotBlank
            @Email
            String correo,

            @NotBlank
            String contrasena
    ) {
    }

    public record SolicitudGoogle(
            @NotBlank
            String credential
    ) {
    }

    public record Respuesta(
            Long idUsuario,
            String nombreCompleto,
            String correo,
            RolUsuario rol,
            String token
    ) {
    }
}