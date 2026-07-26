package com.votaya.votaya_backend.dto;

import jakarta.validation.constraints.NotEmpty;

import java.time.LocalDateTime;
import java.util.List;

import com.votaya.votaya_backend.enumeraciones.TipoVoto;

public final class VotoDTO {

    private VotoDTO() {
    }

    public record SolicitudEmitir(
            @NotEmpty List<Long> idsOpciones) {
    }

    public record SolicitudCambiar(
            @NotEmpty List<Long> idsOpciones,

            String tokenCambio) {
    }

    public record RespuestaEmision(
            String mensaje,
            String folioPublico,
            String tokenCambio) {
    }

    public record ResultadoOpcion(
            Long idOpcion,
            String nombre,
            long totalVotos,
            double porcentaje) {
    }

    public record RespuestaResultados(
            Long idVotacion,
            String titulo,
            long totalVotantes,
            long totalSelecciones,
            List<ResultadoOpcion> opciones) {
    }

    public record RespuestaParticipacion(
            Long idParticipacion,
            Long idVotacion,
            String tituloVotacion,
            TipoVoto tipoVoto,
            LocalDateTime fechaVoto) {
    }
}