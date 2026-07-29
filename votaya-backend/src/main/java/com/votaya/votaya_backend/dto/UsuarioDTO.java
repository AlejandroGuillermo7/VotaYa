package com.votaya.votaya_backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.votaya.votaya_backend.enumeraciones.EstadoUsuario;
import com.votaya.votaya_backend.enumeraciones.RolUsuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class UsuarioDTO {

    private UsuarioDTO() {
    }

    public record SolicitudActualizar(
            @NotBlank
            @Size(max = 100)
            String nombres,

            @NotBlank
            @Size(max = 80)
            String apellidoPaterno,

            @Size(max = 80)
            String apellidoMaterno,

            @Past
            LocalDate fechaNacimiento,

            @NotBlank
            @Email
            @Size(max = 150)
            String correo,

            @Pattern(
                    regexp = "^$|^\\+[1-9][0-9]{9,14}$",
                    message = "El teléfono debe incluir código de país, por ejemplo +529511234567"
            )
            String telefono,

            @Size(max = 500)
            String fotoUrl,

            @Size(min = 8, max = 72)
            String nuevaContrasena
    ) {
    }

    public record Respuesta(
            Long idUsuario,
            String nombres,
            String apellidoPaterno,
            String apellidoMaterno,
            LocalDate fechaNacimiento,
            String correo,
            String telefono,
            String fotoUrl,
            RolUsuario rol,
            EstadoUsuario estado,
            Boolean correoVerificado,
            LocalDateTime fechaRegistro
    ) {
    }
}