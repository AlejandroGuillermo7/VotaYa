package com.votaya.votaya_backend.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

import com.votaya.votaya_backend.enumeraciones.RolUsuario;

public final class AutenticacionDTO {

        private AutenticacionDTO() {
        }

        public record SolicitudRegistro(
                        @NotBlank 
                        @Size(max = 100) 
                        String 
                        nombres,

                        @NotBlank
                        @Size(max = 80)
                        String
                        apellidoPaterno,

                        @Size(max = 80)
                        String 
                        apellidoMaterno,

                        @NotNull @Past LocalDate fechaNacimiento,

                        @NotBlank @Email @Size(max = 150) String correo,

                        @NotBlank @Size(min = 6, max = 72) String contrasena) {
        }

        public record SolicitudLogin(
                        @NotBlank @Email String correo,

                        @NotBlank String contrasena) {
        }

        public record Respuesta(
                        Long idUsuario,
                        String nombreCompleto,
                        String correo,
                        RolUsuario rol,
                        String token) {
        }
}