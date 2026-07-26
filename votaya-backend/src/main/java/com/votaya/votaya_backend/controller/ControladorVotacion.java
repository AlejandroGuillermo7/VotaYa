package com.votaya.votaya_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import com.votaya.votaya_backend.dto.VotacionDTO;
import com.votaya.votaya_backend.service.ServicioVotacion;

import java.util.List;

@RestController
@RequestMapping("/api/votaciones")
@RequiredArgsConstructor
public class ControladorVotacion {

    private final ServicioVotacion servicioVotacion;

    @PostMapping
    public ResponseEntity<VotacionDTO.Respuesta> crear(
            @Valid @RequestBody VotacionDTO.SolicitudGuardar solicitud) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(servicioVotacion.crear(solicitud));
    }

    @GetMapping("/disponibles")
    public ResponseEntity<List<VotacionDTO.Respuesta>> listarDisponibles() {
        return ResponseEntity.ok(
                servicioVotacion.listarDisponibles());
    }

    @GetMapping("/mias")
    public ResponseEntity<List<VotacionDTO.Respuesta>> listarMias() {
        return ResponseEntity.ok(
                servicioVotacion.listarMias());
    }

    @GetMapping("/{idVotacion}")
    public ResponseEntity<VotacionDTO.Respuesta> obtenerDetalle(
            @PathVariable Long idVotacion) {
        return ResponseEntity.ok(
                servicioVotacion.obtenerDetalle(
                        idVotacion));
    }

    @PutMapping("/{idVotacion}")
    public ResponseEntity<VotacionDTO.Respuesta> actualizar(
            @PathVariable Long idVotacion,
            @Valid @RequestBody VotacionDTO.SolicitudGuardar solicitud) {
        return ResponseEntity.ok(
                servicioVotacion.actualizar(
                        idVotacion,
                        solicitud));
    }

    @PatchMapping("/{idVotacion}/cancelar")
    public ResponseEntity<Void> cancelar(
            @PathVariable Long idVotacion) {
        servicioVotacion.cancelar(idVotacion);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{idVotacion}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long idVotacion) {
        servicioVotacion.eliminar(idVotacion);
        return ResponseEntity.noContent().build();
    }
}