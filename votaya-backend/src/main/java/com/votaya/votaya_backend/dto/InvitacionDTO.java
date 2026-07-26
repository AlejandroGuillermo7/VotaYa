package com.votaya.votaya_backend.dto;

import com.votaya.votaya_backend.enumeraciones.EstadoInvitacion;

import jakarta.validation.constraints.NotNull;

public final class InvitacionDTO {

    private InvitacionDTO() {
    }

    public record SolicitudRespuesta(
            @NotNull EstadoInvitacion estado) {
    }

    public record Respuesta(
            Long idInvitacion,
            Long idVotacion,
            Long idUsuario,
            EstadoInvitacion estado) {
    }
}