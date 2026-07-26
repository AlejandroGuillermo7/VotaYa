package com.votaya.votaya_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.votaya.votaya_backend.dto.RecuperacionDTO;
import com.votaya.votaya_backend.service.ServicioRecuperacion;

@RestController
@RequestMapping("/api/recuperacion")
@RequiredArgsConstructor
public class ControladorRecuperacion {

    private final ServicioRecuperacion servicioRecuperacion;

    @PostMapping("/solicitar")
    public ResponseEntity<RecuperacionDTO.RespuestaToken> solicitar(
            @Valid @RequestBody RecuperacionDTO.SolicitudToken solicitud) {
        return ResponseEntity.ok(
                servicioRecuperacion.solicitar(solicitud));
    }

    @PostMapping("/restablecer")
    public ResponseEntity<Void> restablecer(
            @Valid @RequestBody RecuperacionDTO.SolicitudRestablecer solicitud) {
        servicioRecuperacion.restablecer(solicitud);
        return ResponseEntity.noContent().build();
    }
}