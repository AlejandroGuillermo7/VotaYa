package com.votaya.votaya_backend.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.votaya.votaya_backend.Excepciones.RecursoNoEncontradoExcepcion;
import com.votaya.votaya_backend.Excepciones.ReglaNegocioExcepcion;
import com.votaya.votaya_backend.Repository.TokenRecuperacionRepositorio;
import com.votaya.votaya_backend.Repository.UsuarioRepositorio;
import com.votaya.votaya_backend.dto.RecuperacionDTO;
import com.votaya.votaya_backend.enumeraciones.EstadoUsuario;
import com.votaya.votaya_backend.model.TokenRecuperacion;
import com.votaya.votaya_backend.model.Usuario;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ServicioRecuperacion {

    private final UsuarioRepositorio usuarioRepositorio;
    private final TokenRecuperacionRepositorio tokenRepositorio;
    private final PasswordEncoder codificadorContrasena;
    private final ServicioWhatsApp servicioWhatsApp;

    private final SecureRandom generadorSeguro =
            new SecureRandom();

    @Transactional
    public RecuperacionDTO.RespuestaToken solicitar(
            RecuperacionDTO.SolicitudToken solicitud
    ) {
        String correo = solicitud.correo()
                .trim()
                .toLowerCase();

        Usuario usuario = usuarioRepositorio
                .findByCorreoIgnoreCase(correo)
                .orElseThrow(
                        () -> new RecursoNoEncontradoExcepcion(
                                "No existe una cuenta con ese correo"
                        )
                );

        if (
                usuario.getEstado()
                        == EstadoUsuario.ELIMINADO
        ) {
            throw new ReglaNegocioExcepcion(
                    "La cuenta fue eliminada"
            );
        }

        if (
                usuario.getTelefono() == null
                || usuario.getTelefono().isBlank()
        ) {
            throw new ReglaNegocioExcepcion(
                    "Esta cuenta no tiene un teléfono registrado"
            );
        }

        String codigo = generarCodigo();
        String hash = calcularHash(codigo);

        TokenRecuperacion recuperacion =
                TokenRecuperacion.builder()
                        .usuario(usuario)
                        .tokenHash(hash)
                        .fechaExpiracion(
                                LocalDateTime.now()
                                        .plusMinutes(10)
                        )
                        .utilizado(false)
                        .build();

        /*
         * Guardamos primero para tener el código registrado.
         * Si WhatsApp falla, la transacción se revierte.
         */
        tokenRepositorio.saveAndFlush(recuperacion);

        servicioWhatsApp.enviarCodigoRecuperacion(
                usuario.getTelefono(),
                codigo
        );

        String telefonoOculto =
                ocultarTelefono(
                        usuario.getTelefono()
                );

        return new RecuperacionDTO.RespuestaToken(
                "Enviamos un código por WhatsApp al número "
                        + telefonoOculto,
                ""
        );
    }

    @Transactional
    public void restablecer(
            RecuperacionDTO.SolicitudRestablecer solicitud
    ) {
        String codigo = solicitud.token()
                .trim();

        String hash = calcularHash(codigo);

        TokenRecuperacion token =
                tokenRepositorio
                        .findByTokenHashAndUtilizadoFalse(
                                hash
                        )
                        .orElseThrow(
                                () -> new ReglaNegocioExcepcion(
                                        "El código es inválido"
                                )
                        );

        if (
                LocalDateTime.now()
                        .isAfter(
                                token.getFechaExpiracion()
                        )
        ) {
            throw new ReglaNegocioExcepcion(
                    "El código ya expiró"
            );
        }

        Usuario usuario =
                token.getUsuario();

        usuario.setPasswordHash(
                codificadorContrasena.encode(
                        solicitud.nuevaContrasena()
                )
        );

        usuarioRepositorio.save(usuario);

        token.setUtilizado(true);

        tokenRepositorio.save(token);
    }

    private String generarCodigo() {
        int numero =
                generadorSeguro.nextInt(
                        1_000_000
                );

        return String.format(
                "%06d",
                numero
        );
    }

    private String calcularHash(
            String valor
    ) {
        try {
            MessageDigest resumen =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );

            byte[] resultado =
                    resumen.digest(
                            valor.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            return HexFormat.of()
                    .formatHex(resultado);

        } catch (
                NoSuchAlgorithmException excepcion
        ) {
            throw new IllegalStateException(
                    "No se pudo calcular el hash",
                    excepcion
            );
        }
    }

    private String ocultarTelefono(
            String telefono
    ) {
        if (
                telefono == null
                || telefono.length() < 4
        ) {
            return "registrado";
        }

        String ultimosCuatro =
                telefono.substring(
                        telefono.length() - 4
                );

        return "*******" + ultimosCuatro;
    }
}