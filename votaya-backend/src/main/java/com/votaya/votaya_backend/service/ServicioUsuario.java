package com.votaya.votaya_backend.service;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.votaya.votaya_backend.Excepciones.RecursoNoEncontradoExcepcion;
import com.votaya.votaya_backend.Excepciones.ReglaNegocioExcepcion;
import com.votaya.votaya_backend.Repository.UsuarioRepositorio;
import com.votaya.votaya_backend.dto.UsuarioDTO;
import com.votaya.votaya_backend.enumeraciones.EstadoUsuario;
import com.votaya.votaya_backend.model.Usuario;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ServicioUsuario {

        private final UsuarioRepositorio usuarioRepositorio;
        private final ServicioUsuarioActual servicioUsuarioActual;
        private final ServicioAuditoria servicioAuditoria;
        private final ServicioArchivos servicioArchivos;

        @Transactional(readOnly = true)
        public UsuarioDTO.Respuesta obtenerPerfil() {
                Usuario usuario = servicioUsuarioActual.obtener();

                return convertir(usuario);
        }

        @Transactional
        public UsuarioDTO.Respuesta actualizarPerfil(
                        UsuarioDTO.SolicitudActualizar solicitud,
                        MultipartFile foto) {
                Usuario usuario = servicioUsuarioActual.obtener();

                usuario.setNombres(
                                solicitud.nombres().trim());

                usuario.setApellidoPaterno(
                                solicitud.apellidoPaterno().trim());

                usuario.setApellidoMaterno(
                                limpiar(solicitud.apellidoMaterno()));

                usuario.setFechaNacimiento(
                                solicitud.fechaNacimiento());

                /*
                 * Solo cambia fotoUrl cuando el usuario
                 * realmente envía una fotografía nueva.
                 *
                 * Si no manda foto, conserva la anterior.
                 */
                if (foto != null && !foto.isEmpty()) {
                        String nuevaFotoUrl = servicioArchivos.guardarImagen(foto);

                        usuario.setFotoUrl(nuevaFotoUrl);
                }

                Usuario usuarioGuardado = usuarioRepositorio.save(usuario);

                servicioAuditoria.registrar(
                                usuarioGuardado,
                                "ACTUALIZAR_PERFIL",
                                "USUARIO",
                                usuarioGuardado.getIdUsuario(),
                                null);

                return convertir(usuarioGuardado);
        }

        @Transactional(readOnly = true)
        @PreAuthorize("hasRole('ADMINISTRADOR')")
        public List<UsuarioDTO.Respuesta> listarTodos() {
                return usuarioRepositorio
                                .findAllByEstadoOrderByFechaRegistroDesc(
                                                EstadoUsuario.ACTIVO)
                                .stream()
                                .map(this::convertir)
                                .toList();
        }

        @Transactional
        @PreAuthorize("hasRole('ADMINISTRADOR')")
        public void eliminarLogicamente(Long idUsuario) {
                Usuario administrador = servicioUsuarioActual.obtener();

                if (administrador
                                .getIdUsuario()
                                .equals(idUsuario)) {

                        throw new ReglaNegocioExcepcion(
                                        "No puedes eliminar tu propia cuenta administrativa");
                }

                Usuario usuario = usuarioRepositorio
                                .findById(idUsuario)
                                .orElseThrow(() -> new RecursoNoEncontradoExcepcion(
                                                "Usuario no encontrado"));

                usuario.setEstado(EstadoUsuario.ELIMINADO);

                usuarioRepositorio.save(usuario);

                servicioAuditoria.registrar(
                                administrador,
                                "ELIMINAR_USUARIO",
                                "USUARIO",
                                idUsuario,
                                null);
        }

        private UsuarioDTO.Respuesta convertir(
                        Usuario usuario) {
                return new UsuarioDTO.Respuesta(
                                usuario.getIdUsuario(),
                                usuario.getNombres(),
                                usuario.getApellidoPaterno(),
                                usuario.getApellidoMaterno(),
                                usuario.getFechaNacimiento(),
                                usuario.getCorreo(),
                                usuario.getFotoUrl(),
                                usuario.getRol(),
                                usuario.getEstado(),
                                usuario.getCorreoVerificado(),
                                usuario.getFechaRegistro());
        }

        private String limpiar(String valor) {
                return valor == null || valor.isBlank()
                                ? null
                                : valor.trim();
        }
}