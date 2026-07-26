package com.votaya.votaya_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.votaya.votaya_backend.dto.UsuarioDTO;
import com.votaya.votaya_backend.service.ServicioUsuario;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class ControladorUsuario {

    private final ServicioUsuario servicioUsuario;

    @GetMapping("/perfil")
    public ResponseEntity<UsuarioDTO.Respuesta> obtenerPerfil() {
        return ResponseEntity.ok(
                servicioUsuario.obtenerPerfil());
    }

    @PutMapping("/perfil")
    public ResponseEntity<UsuarioDTO.Respuesta> actualizarPerfil(
            @Valid @RequestBody UsuarioDTO.SolicitudActualizar solicitud) {
        return ResponseEntity.ok(
                servicioUsuario.actualizarPerfil(
                        solicitud));
    }
}