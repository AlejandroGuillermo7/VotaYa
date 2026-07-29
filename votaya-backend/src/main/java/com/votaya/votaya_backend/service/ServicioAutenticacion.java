package com.votaya.votaya_backend.service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDate;
import java.util.Collections;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.votaya.votaya_backend.Excepciones.ReglaNegocioExcepcion;
import com.votaya.votaya_backend.Repository.UsuarioRepositorio;
import com.votaya.votaya_backend.dto.AutenticacionDTO;
import com.votaya.votaya_backend.enumeraciones.EstadoUsuario;
import com.votaya.votaya_backend.enumeraciones.RolUsuario;
import com.votaya.votaya_backend.model.Usuario;
import com.votaya.votaya_backend.security.UtilidadJwt;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ServicioAutenticacion {

    private final UsuarioRepositorio usuarioRepositorio;
    private final PasswordEncoder codificadorContrasena;
    private final AuthenticationManager administradorAutenticacion;
    private final UtilidadJwt utilidadJwt;
    private final ServicioAuditoria servicioAuditoria;

    @Value("${google.client-id}")
    private String googleClientId;

    @Transactional
    public AutenticacionDTO.Respuesta registrar(
            AutenticacionDTO.SolicitudRegistro solicitud
    ) {
        String correo = solicitud.correo()
                .trim()
                .toLowerCase();

        if (usuarioRepositorio.existsByCorreoIgnoreCase(correo)) {
            throw new ReglaNegocioExcepcion(
                    "El correo ya está registrado"
            );
        }

        Usuario usuario = Usuario.builder()
                .nombres(solicitud.nombres().trim())
                .apellidoPaterno(
                        solicitud.apellidoPaterno().trim()
                )
                .apellidoMaterno(
                        limpiar(solicitud.apellidoMaterno())
                )
                .fechaNacimiento(
                        solicitud.fechaNacimiento()
                )
                .correo(correo)
                .passwordHash(
                        codificadorContrasena.encode(
                                solicitud.contrasena()
                        )
                )
                .fotoUrl(solicitud.fotoUrl())
                .rol(RolUsuario.USUARIO)
                .estado(EstadoUsuario.ACTIVO)
                .correoVerificado(false)
                .build();

        usuarioRepositorio.save(usuario);

        servicioAuditoria.registrar(
                usuario,
                "REGISTRAR_USUARIO",
                "USUARIO",
                usuario.getIdUsuario(),
                null
        );

        return crearRespuesta(usuario);
    }

    public AutenticacionDTO.Respuesta iniciarSesion(
            AutenticacionDTO.SolicitudLogin solicitud
    ) {
        String correo = solicitud.correo()
                .trim()
                .toLowerCase();

        administradorAutenticacion.authenticate(
                new UsernamePasswordAuthenticationToken(
                        correo,
                        solicitud.contrasena()
                )
        );

        Usuario usuario = usuarioRepositorio
                .findByCorreoIgnoreCase(correo)
                .orElseThrow(
                        () -> new BadCredentialsException(
                                "Credenciales incorrectas"
                        )
                );

        validarUsuarioActivo(usuario);

        servicioAuditoria.registrar(
                usuario,
                "INICIAR_SESION",
                "USUARIO",
                usuario.getIdUsuario(),
                null
        );

        return crearRespuesta(usuario);
    }

    @Transactional
    public AutenticacionDTO.Respuesta iniciarSesionGoogle(
            AutenticacionDTO.SolicitudGoogle solicitud
    ) {
        GoogleIdToken.Payload datosGoogle =
                validarTokenGoogle(
                        solicitud.credential()
                );

        String correo = limpiar(
                datosGoogle.getEmail()
        );

        if (correo == null) {
            throw new ReglaNegocioExcepcion(
                    "Google no proporcionó un correo"
            );
        }

        correo = correo.toLowerCase();

        if (!Boolean.TRUE.equals(
                datosGoogle.getEmailVerified()
        )) {
            throw new ReglaNegocioExcepcion(
                    "El correo de Google no está verificado"
            );
        }

        String correoFinal = correo;

        Usuario usuario = usuarioRepositorio
                .findByCorreoIgnoreCase(correo)
                .orElseGet(
                        () -> crearUsuarioGoogle(
                                datosGoogle,
                                correoFinal
                        )
                );

        validarUsuarioActivo(usuario);

        servicioAuditoria.registrar(
                usuario,
                "INICIAR_SESION_GOOGLE",
                "USUARIO",
                usuario.getIdUsuario(),
                null
        );

        return crearRespuesta(usuario);
    }

    private GoogleIdToken.Payload validarTokenGoogle(
            String credential
    ) {
        try {
            GoogleIdTokenVerifier verificador =
                    new GoogleIdTokenVerifier.Builder(
                            new NetHttpTransport(),
                            GsonFactory.getDefaultInstance()
                    )
                            .setAudience(
                                    Collections.singletonList(
                                            googleClientId
                                    )
                            )
                            .build();

            GoogleIdToken token =
                    verificador.verify(credential);

            if (token == null) {
                throw new ReglaNegocioExcepcion(
                        "La credencial de Google no es válida"
                );
            }

            return token.getPayload();

        } catch (
                GeneralSecurityException |
                IOException excepcion
        ) {
            throw new ReglaNegocioExcepcion(
                    "No fue posible validar la cuenta de Google"
            );
        }
    }

    private Usuario crearUsuarioGoogle(
            GoogleIdToken.Payload datos,
            String correo
    ) {
        String nombres = obtenerDato(
                datos,
                "given_name"
        );

        String apellidos = obtenerDato(
                datos,
                "family_name"
        );

        String nombreCompleto = obtenerDato(
                datos,
                "name"
        );

        String fotoUrl = obtenerDato(
                datos,
                "picture"
        );

        if (nombres == null) {
            nombres = obtenerPrimerNombre(
                    nombreCompleto
            );
        }

        if (nombres == null) {
            nombres = "Usuario";
        }

        String apellidoPaterno =
                obtenerApellidoPaterno(
                        apellidos,
                        nombreCompleto,
                        nombres
                );

        String apellidoMaterno =
                obtenerApellidoMaterno(
                        apellidos
                );

        String contrasenaAleatoria =
                UUID.randomUUID()
                        + "-"
                        + UUID.randomUUID();

        Usuario usuario = Usuario.builder()
                .nombres(
                        limitar(nombres, 100)
                )
                .apellidoPaterno(
                        limitar(
                                apellidoPaterno,
                                80
                        )
                )
                .apellidoMaterno(
                        limitarOpcional(
                                apellidoMaterno,
                                80
                        )
                )
                /*
                 * Google no proporciona fecha de nacimiento
                 * durante este inicio de sesión.
                 */
                .fechaNacimiento(
                        LocalDate.of(2000, 1, 1)
                )
                .correo(correo)
                .passwordHash(
                        codificadorContrasena.encode(
                                contrasenaAleatoria
                        )
                )
                .fotoUrl(
                        limitarOpcional(
                                fotoUrl,
                                500
                        )
                )
                .rol(RolUsuario.USUARIO)
                .estado(EstadoUsuario.ACTIVO)
                .correoVerificado(true)
                .build();

        usuarioRepositorio.save(usuario);

        servicioAuditoria.registrar(
                usuario,
                "REGISTRAR_USUARIO_GOOGLE",
                "USUARIO",
                usuario.getIdUsuario(),
                null
        );

        return usuario;
    }

    private String obtenerDato(
            GoogleIdToken.Payload datos,
            String clave
    ) {
        Object valor = datos.get(clave);

        return valor == null
                ? null
                : limpiar(valor.toString());
    }

    private String obtenerPrimerNombre(
            String nombreCompleto
    ) {
        if (nombreCompleto == null) {
            return null;
        }

        String[] partes =
                nombreCompleto.split("\\s+");

        return partes.length == 0
                ? null
                : partes[0];
    }

    private String obtenerApellidoPaterno(
            String apellidos,
            String nombreCompleto,
            String nombres
    ) {
        if (apellidos != null) {
            String[] partes =
                    apellidos.split("\\s+");

            if (partes.length > 0) {
                return partes[0];
            }
        }

        if (nombreCompleto != null) {
            String[] partes =
                    nombreCompleto.split("\\s+");

            if (partes.length > 1) {
                return partes[partes.length - 1];
            }
        }

        return "Google";
    }

    private String obtenerApellidoMaterno(
            String apellidos
    ) {
        if (apellidos == null) {
            return null;
        }

        String[] partes =
                apellidos.split("\\s+");

        if (partes.length < 2) {
            return null;
        }

        return String.join(
                " ",
                java.util.Arrays.copyOfRange(
                        partes,
                        1,
                        partes.length
                )
        );
    }

    private void validarUsuarioActivo(
            Usuario usuario
    ) {
        if (
                usuario.getEstado()
                        == EstadoUsuario.ELIMINADO
        ) {
            throw new BadCredentialsException(
                    "La cuenta fue eliminada"
            );
        }
    }

    private AutenticacionDTO.Respuesta crearRespuesta(
            Usuario usuario
    ) {
        return new AutenticacionDTO.Respuesta(
                usuario.getIdUsuario(),
                nombreCompleto(usuario),
                usuario.getCorreo(),
                usuario.getRol(),
                utilidadJwt.generarToken(usuario)
        );
    }

    private String nombreCompleto(
            Usuario usuario
    ) {
        String nombre =
                usuario.getNombres()
                        + " "
                        + usuario.getApellidoPaterno();

        if (
                usuario.getApellidoMaterno() != null
                && !usuario.getApellidoMaterno()
                        .isBlank()
        ) {
            nombre +=
                    " "
                    + usuario.getApellidoMaterno();
        }

        return nombre;
    }

    private String limitar(
            String valor,
            int maximo
    ) {
        String limpio =
                valor == null || valor.isBlank()
                        ? "Google"
                        : valor.trim();

        return limpio.length() <= maximo
                ? limpio
                : limpio.substring(0, maximo);
    }

    private String limitarOpcional(
            String valor,
            int maximo
    ) {
        if (valor == null || valor.isBlank()) {
            return null;
        }

        String limpio = valor.trim();

        return limpio.length() <= maximo
                ? limpio
                : limpio.substring(0, maximo);
    }

    private String limpiar(String valor) {
        return valor == null || valor.isBlank()
                ? null
                : valor.trim();
    }
}