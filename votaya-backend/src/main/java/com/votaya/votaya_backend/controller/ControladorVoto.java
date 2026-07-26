package com.votaya.votaya_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import com.votaya.votaya_backend.dto.VotoDTO;
import com.votaya.votaya_backend.service.ServicioVoto;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ControladorVoto {

    private final ServicioVoto servicioVoto;

    @PostMapping("/api/votaciones/{idVotacion}/votos")
    public ResponseEntity<VotoDTO.RespuestaEmision> votar(
            @PathVariable Long idVotacion,
            @Valid
            @RequestBody
            VotoDTO.SolicitudEmitir solicitud
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        servicioVoto.emitir(
                                idVotacion,
                                solicitud
                        )
                );
    }

    @PutMapping("/api/votaciones/{idVotacion}/votos/mi-voto")
    public ResponseEntity<VotoDTO.RespuestaEmision>
    cambiarVoto(
            @PathVariable Long idVotacion,
            @Valid
            @RequestBody
            VotoDTO.SolicitudCambiar solicitud
    ) {
        return ResponseEntity.ok(
                servicioVoto.cambiar(
                        idVotacion,
                        solicitud
                )
        );
    }

    @GetMapping("/api/votaciones/{idVotacion}/resultados")
    public ResponseEntity<VotoDTO.RespuestaResultados>
    resultados(
            @PathVariable Long idVotacion
    ) {
        return ResponseEntity.ok(
                servicioVoto.obtenerResultados(
                        idVotacion
                )
        );
    }

    @GetMapping("/api/votos/mios")
    public ResponseEntity<List<VotoDTO.RespuestaParticipacion>>
    misVotos() {
        return ResponseEntity.ok(
                servicioVoto.listarMisParticipaciones()
        );
    }
}