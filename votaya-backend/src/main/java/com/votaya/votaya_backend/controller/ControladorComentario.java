package com.votaya.votaya_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import com.votaya.votaya_backend.dto.ComentarioDTO;
import com.votaya.votaya_backend.service.ServicioComentario;

import java.util.List;

@RestController
@RequestMapping("/api/votaciones/{idVotacion}/comentarios")
@RequiredArgsConstructor
public class ControladorComentario {

    private final ServicioComentario servicioComentario;

    @PostMapping
    public ResponseEntity<ComentarioDTO.Respuesta> crear(
            @PathVariable Long idVotacion,
            @Valid @RequestBody ComentarioDTO.Solicitud solicitud) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        servicioComentario.crear(
                                idVotacion,
                                solicitud));
    }

    @GetMapping
    public ResponseEntity<List<ComentarioDTO.Respuesta>> listar(
            @PathVariable Long idVotacion) {
        return ResponseEntity.ok(
                servicioComentario.listar(
                        idVotacion));
    }
}