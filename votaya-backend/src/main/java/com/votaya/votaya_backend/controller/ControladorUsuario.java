package com.votaya.votaya_backend.controller;

import com.votaya.votaya_backend.dto.UsuarioDTO;
import com.votaya.votaya_backend.service.ServicioUsuario;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class ControladorUsuario {

    private final ServicioUsuario servicioUsuario;

    @GetMapping("/perfil")
    public ResponseEntity<UsuarioDTO.Respuesta> obtenerPerfil() {
        UsuarioDTO.Respuesta respuesta = servicioUsuario.obtenerPerfil();
        return ResponseEntity.ok(respuesta);
    }

    public record SolicitudVerificarPassword(@NotBlank String passwordActual) {}

    @PostMapping("/verificar-password")
    public ResponseEntity<Map<String, String>> verificarPassword(
            @Valid @RequestBody SolicitudVerificarPassword solicitud) {
        
        servicioUsuario.verificarPasswordActual(solicitud.passwordActual());
        return ResponseEntity.ok(Map.of("mensaje", "Contraseña verificada correctamente"));
    }

    @PutMapping(
            value = "/perfil",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<UsuarioDTO.Respuesta> actualizarPerfil(
            @Valid @RequestPart("datos") UsuarioDTO.SolicitudActualizar solicitud,
            @RequestPart(value = "foto", required = false) MultipartFile foto
    ) {
        UsuarioDTO.Respuesta respuesta = servicioUsuario.actualizarPerfil(solicitud, foto);
        return ResponseEntity.ok(respuesta);
    }
}