package com.votaya.votaya_backend.controller;

import java.util.Map;

import com.votaya.votaya_backend.dto.UsuarioDTO;
import com.votaya.votaya_backend.service.ServicioUsuario;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class ControladorUsuario {

    private final ServicioUsuario servicioUsuario;

    @GetMapping("/perfil")
    public ResponseEntity<UsuarioDTO.Respuesta>
    obtenerPerfil() {

        UsuarioDTO.Respuesta respuesta =
                servicioUsuario.obtenerPerfil();

        return ResponseEntity.ok(respuesta);
    }

    @PutMapping(
            value = "/perfil",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<UsuarioDTO.Respuesta>
    actualizarPerfil(
            @Valid
            @RequestPart("datos")
            UsuarioDTO.SolicitudActualizar solicitud,

            @RequestPart(
                    value = "foto",
                    required = false
            )
            MultipartFile foto
    ) {
        UsuarioDTO.Respuesta respuesta =
                servicioUsuario.actualizarPerfil(
                        solicitud,
                        foto
                );

        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/verificar-password")
    public ResponseEntity<Map<String, String>>
    verificarPassword(
            @RequestBody Map<String, String> solicitud
    ) {
        servicioUsuario.verificarPasswordActual(
                solicitud.get("passwordActual")
        );

        return ResponseEntity.ok(
                Map.of("mensaje", "Contraseña verificada correctamente.")
        );
    }
}