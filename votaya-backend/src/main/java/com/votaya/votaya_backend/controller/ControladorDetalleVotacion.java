package com.votaya.votaya_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.votaya.votaya_backend.dto.DetalleVotacionDTO;
import com.votaya.votaya_backend.service.ServicioDetalleVotacion;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/votaciones")
@RequiredArgsConstructor
public class ControladorDetalleVotacion {

    private final ServicioDetalleVotacion servicioDetalleVotacion;

    @GetMapping("/{idVotacion}/participantes")
    public ResponseEntity<DetalleVotacionDTO.RespuestaParticipantes>
    obtenerParticipantes(
            @PathVariable Long idVotacion
    ) {
        return ResponseEntity.ok(
                servicioDetalleVotacion.obtenerParticipantes(idVotacion)
        );
    }
}
