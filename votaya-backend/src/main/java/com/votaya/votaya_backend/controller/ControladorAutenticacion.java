package com.votaya.votaya_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import com.votaya.votaya_backend.dto.AutenticacionDTO;
import com.votaya.votaya_backend.service.ServicioAutenticacion;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class ControladorAutenticacion {

    private final ServicioAutenticacion servicioAutenticacion;

    @PostMapping("/registro")
    public ResponseEntity<AutenticacionDTO.Respuesta> registrar(
            @Valid
            @RequestBody
            AutenticacionDTO.SolicitudRegistro solicitud
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        servicioAutenticacion.registrar(
                                solicitud
                        )
                );
    }

    @PostMapping("/login")
    public ResponseEntity<AutenticacionDTO.Respuesta> login(
            @Valid
            @RequestBody
            AutenticacionDTO.SolicitudLogin solicitud
    ) {
        return ResponseEntity.ok(
                servicioAutenticacion.iniciarSesion(
                        solicitud
                )
        );
    }
}