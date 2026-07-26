package com.votaya.votaya_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.votaya.votaya_backend.Excepciones.ReglaNegocioExcepcion;
import com.votaya.votaya_backend.Repository.UsuarioRepositorio;
import com.votaya.votaya_backend.dto.AutenticacionDTO;
import com.votaya.votaya_backend.enumeraciones.EstadoUsuario;
import com.votaya.votaya_backend.enumeraciones.RolUsuario;
import com.votaya.votaya_backend.model.Usuario;
import com.votaya.votaya_backend.security.UtilidadJwt;

@Service
@RequiredArgsConstructor
public class ServicioAutenticacion {

    private final UsuarioRepositorio usuarioRepositorio;
    private final PasswordEncoder codificadorContrasena;
    private final AuthenticationManager administradorAutenticacion;
    private final UtilidadJwt utilidadJwt;
    private final ServicioAuditoria servicioAuditoria;

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
        administradorAutenticacion.authenticate(
                new UsernamePasswordAuthenticationToken(
                        solicitud.correo().trim().toLowerCase(),
                        solicitud.contrasena()
                )
        );

        Usuario usuario = usuarioRepositorio
                .findByCorreoIgnoreCase(solicitud.correo())
                .orElseThrow(() ->
                        new BadCredentialsException(
                                "Credenciales incorrectas"
                        )
                );

        if (usuario.getEstado() == EstadoUsuario.ELIMINADO) {
            throw new BadCredentialsException(
                    "La cuenta fue eliminada"
            );
        }

        servicioAuditoria.registrar(
                usuario,
                "INICIAR_SESION",
                "USUARIO",
                usuario.getIdUsuario(),
                null
        );

        return crearRespuesta(usuario);
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

    private String nombreCompleto(Usuario usuario) {
        String nombre = usuario.getNombres()
                + " "
                + usuario.getApellidoPaterno();

        if (usuario.getApellidoMaterno() != null
                && !usuario.getApellidoMaterno().isBlank()) {
            nombre += " " + usuario.getApellidoMaterno();
        }

        return nombre;
    }

    private String limpiar(String valor) {
        return valor == null || valor.isBlank()
                ? null
                : valor.trim();
    }
}