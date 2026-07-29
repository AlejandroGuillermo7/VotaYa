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
        String telefono = normalizarTelefono(
        solicitud.telefono()
        );

        if (usuarioRepositorio.existsByTelefono(telefono)) {
        throw new ReglaNegocioExcepcion(
                "El número telefónico ya está registrado"
        );
        }
        if (usuarioRepositorio.existsByCorreoIgnoreCase(correo)) {
            throw new ReglaNegocioExcepcion(
                    "El correo ya está registrado"
            );
        }

        Usuario usuario = Usuario.builder()
                .nombres(
                        solicitud.nombres().trim()
                )
                .apellidoPaterno(
                        solicitud.apellidoPaterno().trim()
                )
                .apellidoMaterno(
                        limpiar(solicitud.apellidoMaterno())
                )
                .fechaNacimiento(
                        solicitud.fechaNacimiento()
                )
                .correo(correo).telefono(telefono)
                .passwordHash(
                        codificadorContrasena.encode(
                                solicitud.contrasena()
                        )
                )
                .fotoUrl(
                        solicitud.fotoUrl()
                )
                .rol(RolUsuario.USUARIO)
                .estado(EstadoUsuario.ACTIVO)
                .correoVerificado(false)
                .build();

        usuarioRepositorio.saveAndFlush(usuario);

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
                    "Google no proporcionó un correo electrónico"
            );
        }

        correo = correo.toLowerCase();

        if (!Boolean.TRUE.equals(
                datosGoogle.getEmailVerified()
        )) {
            throw new ReglaNegocioExcepcion(
                    "El correo proporcionado por Google no está verificado"
            );
        }

        Usuario usuario = usuarioRepositorio
                .findByCorreoIgnoreCase(correo)
                .orElse(null);

        boolean usuarioNuevo = false;

        if (usuario == null) {
            usuario = crearUsuarioGoogle(
                    datosGoogle,
                    correo
            );

            usuarioNuevo = true;
        }

        validarUsuarioActivo(usuario);

        if (usuarioNuevo) {
            servicioAuditoria.registrar(
                    usuario,
                    "REGISTRAR_USUARIO_GOOGLE",
                    "USUARIO",
                    usuario.getIdUsuario(),
                    null
            );
        }

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

            GoogleIdToken tokenGoogle =
                    verificador.verify(
                            credential
                    );

            if (tokenGoogle == null) {
                throw new ReglaNegocioExcepcion(
                        "La credencial de Google no es válida"
                );
            }

            return tokenGoogle.getPayload();

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
            GoogleIdToken.Payload datosGoogle,
            String correo
    ) {
        String nombres = obtenerDatoGoogle(
                datosGoogle,
                "given_name"
        );

        String apellidos = obtenerDatoGoogle(
                datosGoogle,
                "family_name"
        );

        String nombreCompletoGoogle = obtenerDatoGoogle(
                datosGoogle,
                "name"
        );

        String fotoGoogle = obtenerDatoGoogle(
                datosGoogle,
                "picture"
        );

        if (nombres == null || nombres.isBlank()) {
            nombres = obtenerPrimerNombre(
                    nombreCompletoGoogle
            );
        }

        if (nombres == null || nombres.isBlank()) {
            nombres = "Usuario";
        }

        String apellidoPaterno = "Google";
        String apellidoMaterno = null;

        if (apellidos != null && !apellidos.isBlank()) {
            String[] partesApellidos =
                    apellidos.trim()
                            .split("\\s+");

            apellidoPaterno =
                    partesApellidos[0];

            if (partesApellidos.length > 1) {
                apellidoMaterno =
                        String.join(
                                " ",
                                java.util.Arrays.copyOfRange(
                                        partesApellidos,
                                        1,
                                        partesApellidos.length
                                )
                        );
            }
        } else if (
                nombreCompletoGoogle != null
                && !nombreCompletoGoogle.isBlank()
        ) {
            String[] partesNombre =
                    nombreCompletoGoogle.trim()
                            .split("\\s+");

            if (partesNombre.length > 1) {
                apellidoPaterno =
                        partesNombre[
                                partesNombre.length - 1
                        ];
            }
        }

        String contrasenaAleatoria =UUID.randomUUID().toString();

        Usuario usuarioNuevo = Usuario.builder().telefono(null)
                .nombres(
                        limitarTexto(
                                nombres,
                                100,
                                "Usuario"
                        )
                )
                .apellidoPaterno(
                        limitarTexto(
                                apellidoPaterno,
                                80,
                                "Google"
                        )
                )
                .apellidoMaterno(
                        limitarTextoOpcional(
                                apellidoMaterno,
                                80
                        )
                )
                
                
                .fechaNacimiento(
                        LocalDate.of(
                                2000,
                                1,
                                1
                        )
                )
                .correo(correo)
                .passwordHash(
                        codificadorContrasena.encode(
                                contrasenaAleatoria
                        )
                )
                .fotoUrl(
                        limitarTextoOpcional(
                                fotoGoogle,
                                500
                        )
                )
                .rol(RolUsuario.USUARIO)
                .estado(EstadoUsuario.ACTIVO)
                .correoVerificado(true)
                .build();

        return usuarioRepositorio.saveAndFlush(
                usuarioNuevo
        );
    }

    private String obtenerDatoGoogle(
            GoogleIdToken.Payload datos,
            String clave
    ) {
        Object valor = datos.get(clave);

        if (valor == null) {
            return null;
        }

        return limpiar(
                valor.toString()
        );
    }

    private String obtenerPrimerNombre(
            String nombreCompleto
    ) {
        if (
                nombreCompleto == null
                || nombreCompleto.isBlank()
        ) {
            return null;
        }

        String[] partes =
                nombreCompleto.trim()
                        .split("\\s+");

        if (partes.length == 0) {
            return null;
        }

        return partes[0];
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
                && !usuario.getApellidoMaterno().isBlank()
        ) {
            nombre +=
                    " "
                    + usuario.getApellidoMaterno();
        }

        return nombre;
    }

    private String limitarTexto(
            String valor,
            int maximo,
            String valorPredeterminado
    ) {
        String limpio =
                valor == null || valor.isBlank()
                        ? valorPredeterminado
                        : valor.trim();

        if (limpio.length() <= maximo) {
            return limpio;
        }

        return limpio.substring(
                0,
                maximo
        );
    }

    private String limitarTextoOpcional(
            String valor,
            int maximo
    ) {
        if (
                valor == null
                || valor.isBlank()
        ) {
            return null;
        }

        String limpio = valor.trim();

        if (limpio.length() <= maximo) {
            return limpio;
        }

        return limpio.substring(
                0,
                maximo
        );
    }

    private String limpiar(
            String valor
    ) {
        if (
                valor == null
                || valor.isBlank()
        ) {
            return null;
        }

        return valor.trim();
    }

    private String normalizarTelefono(String telefono) {
        if (telefono == null || telefono.isBlank()) {
                throw new ReglaNegocioExcepcion(
                        "El número telefónico es obligatorio"
                );
        }

        String limpio = telefono
                .replace(" ", "")
                .replace("-", "")
                .replace("(", "")
                .replace(")", "")
                .trim();

        if (!limpio.matches("^\\+[1-9][0-9]{9,14}$")) {
                throw new ReglaNegocioExcepcion(
                        "El teléfono debe incluir código de país, por ejemplo +529511234567"
                );
        }

        return limpio;
        }
}