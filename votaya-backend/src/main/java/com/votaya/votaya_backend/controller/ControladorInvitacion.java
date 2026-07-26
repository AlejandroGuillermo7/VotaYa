package com.votaya.votaya_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import com.votaya.votaya_backend.dto.InvitacionDTO;
import com.votaya.votaya_backend.service.ServicioInvitacion;

@RestController
@RequestMapping("/api/invitaciones")
@RequiredArgsConstructor
public class ControladorInvitacion {

    private final ServicioInvitacion servicioInvitacion;

    @PostMapping("/votacion/{idVotacion}/usuario/{idUsuario}")
    public ResponseEntity<InvitacionDTO.Respuesta> invitar(
            @PathVariable Long idVotacion,
            @PathVariable Long idUsuario) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        servicioInvitacion.invitar(
                                idVotacion,
                                idUsuario));
    }

    @PatchMapping("/{idInvitacion}/responder")
    public ResponseEntity<InvitacionDTO.Respuesta> responder(
            @PathVariable Long idInvitacion,
            @Valid @RequestBody InvitacionDTO.SolicitudRespuesta solicitud) {
        return ResponseEntity.ok(
                servicioInvitacion.responder(
                        idInvitacion,
                        solicitud));
    }
}