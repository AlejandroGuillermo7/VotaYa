package com.votaya.votaya_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.votaya.votaya_backend.dto.UsuarioDTO;
import com.votaya.votaya_backend.dto.VotacionDTO;
import com.votaya.votaya_backend.service.ServicioUsuario;
import com.votaya.votaya_backend.service.ServicioVotacion;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class ControladorAdministrador {

        private final ServicioUsuario servicioUsuario;
        private final ServicioVotacion servicioVotacion;

        @GetMapping("/usuarios")
        public ResponseEntity<List<UsuarioDTO.Respuesta>> listarUsuarios() {

                return ResponseEntity.ok(
                                servicioUsuario.listarTodos());
        }

        @DeleteMapping("/usuarios/{idUsuario}")
        public ResponseEntity<Void> eliminarUsuario(
                        @PathVariable Long idUsuario) {
                servicioUsuario.eliminarLogicamente(
                                idUsuario);

                return ResponseEntity
                                .noContent()
                                .build();
        }

        @GetMapping("/votaciones")
        public ResponseEntity<List<VotacionDTO.Respuesta>> listarVotaciones() {

                return ResponseEntity.ok(
                                servicioVotacion
                                                .listarTodasAdministrador());
        }

        @DeleteMapping("/votaciones/{idVotacion}")
        public ResponseEntity<Void> eliminarVotacion(
                        @PathVariable Long idVotacion) {
                servicioVotacion
                                .eliminarComoAdministrador(
                                                idVotacion);

                return ResponseEntity
                                .noContent()
                                .build();
        }
}