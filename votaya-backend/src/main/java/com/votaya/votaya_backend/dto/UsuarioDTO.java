package com.votaya.votaya_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.votaya.votaya_backend.enumeraciones.EstadoUsuario;
import com.votaya.votaya_backend.enumeraciones.RolUsuario;

public final class UsuarioDTO {

    private UsuarioDTO() {
    }

    public record SolicitudActualizar(
            @NotBlank @Size(max = 100) String nombres,

            @NotBlank @Size(max = 80) String apellidoPaterno,

            @Size(max = 80) String apellidoMaterno,

            @Past LocalDate fechaNacimiento,

            @Size(max = 500) String fotoUrl) {
    }

    public record Respuesta(
            Long idUsuario,
            String nombres,
            String apellidoPaterno,
            String apellidoMaterno,
            LocalDate fechaNacimiento,
            String correo,
            String fotoUrl,
            RolUsuario rol,
            EstadoUsuario estado,
            Boolean correoVerificado,
            LocalDateTime fechaRegistro) {
    }
}