package com.votaya.votaya_backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public final class DetalleVotacionDTO {

    private DetalleVotacionDTO() {
    }

    public record Participante(
            Long idUsuario,
            String nombreCompleto,
            String correo,
            String fotoUrl,
            LocalDateTime fechaVoto,
            String opcionSeleccionada
    ) {
    }

    public record RespuestaParticipantes(
            Long idVotacion,
            String tipoVoto,
            boolean anonimatoProtegido,
            int totalParticipantes,
            List<Participante> participantes
    ) {
    }
}
