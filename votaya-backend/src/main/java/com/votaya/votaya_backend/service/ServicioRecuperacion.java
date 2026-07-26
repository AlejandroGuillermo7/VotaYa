package com.votaya.votaya_backend.service;

import lombok.RequiredArgsConstructor;
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

import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ServicioRecuperacion {

    private final UsuarioRepositorio usuarioRepositorio;
    private final TokenRecuperacionRepositorio tokenRepositorio;
    private final PasswordEncoder codificadorContrasena;

    private final SecureRandom generadorSeguro = new SecureRandom();

    @Transactional
    public RecuperacionDTO.RespuestaToken solicitar(
            RecuperacionDTO.SolicitudToken solicitud) {
        Usuario usuario = usuarioRepositorio
                .findByCorreoIgnoreCase(solicitud.correo())
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion(
                        "No existe una cuenta con ese correo"));

        if (usuario.getEstado() == EstadoUsuario.ELIMINADO) {
            throw new ReglaNegocioExcepcion(
                    "La cuenta fue eliminada");
        }

        String token = generarToken();
        String hash = calcularHash(token);

        TokenRecuperacion recuperacion = TokenRecuperacion.builder()
                .usuario(usuario)
                .tokenHash(hash)
                .fechaExpiracion(
                        LocalDateTime.now()
                                .plusMinutes(20))
                .utilizado(false)
                .build();

        tokenRepositorio.save(recuperacion);

        return new RecuperacionDTO.RespuestaToken(
                "Token generado correctamente",
                token);
    }

    @Transactional
    public void restablecer(
            RecuperacionDTO.SolicitudRestablecer solicitud) {
        String hash = calcularHash(solicitud.token());

        TokenRecuperacion token = tokenRepositorio
                .findByTokenHashAndUtilizadoFalse(hash)
                .orElseThrow(() -> new ReglaNegocioExcepcion(
                        "Token inválido"));

        if (LocalDateTime.now()
                .isAfter(token.getFechaExpiracion())) {
            throw new ReglaNegocioExcepcion(
                    "El token ya expiró");
        }

        Usuario usuario = token.getUsuario();

        usuario.setPasswordHash(
                codificadorContrasena.encode(
                        solicitud.nuevaContrasena()));

        usuarioRepositorio.save(usuario);

        token.setUtilizado(true);
        tokenRepositorio.save(token);
    }

    private String generarToken() {
        byte[] bytes = new byte[32];
        generadorSeguro.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    private String calcularHash(String token) {
        try {
            MessageDigest resumen = MessageDigest.getInstance("SHA-256");

            return HexFormat.of().formatHex(
                    resumen.digest(
                            token.getBytes(
                                    StandardCharsets.UTF_8)));

        } catch (NoSuchAlgorithmException excepcion) {
            throw new IllegalStateException(excepcion);
        }
    }
}