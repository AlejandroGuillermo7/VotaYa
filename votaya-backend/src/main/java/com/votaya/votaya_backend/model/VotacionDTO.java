package com.votaya.votaya_backend.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;

import com.votaya.votaya_backend.enumeraciones.EstadoVotacion;
import com.votaya.votaya_backend.enumeraciones.PrivacidadVotacion;
import com.votaya.votaya_backend.enumeraciones.TipoGrafica;
import com.votaya.votaya_backend.enumeraciones.TipoSeleccion;
import com.votaya.votaya_backend.enumeraciones.TipoVoto;

public final class VotacionDTO {

    private VotacionDTO() {
    }

    public record SolicitudOpcion(
            @NotBlank @Size(max = 150) String nombre,

            @Size(max = 500) String imagenUrl) {
    }

    public record SolicitudGuardar(
            @NotBlank @Size(max = 180) String titulo,

            @Size(max = 600) String descripcion,

            @Size(max = 500) String imagenPortadaUrl,

            @NotNull LocalDateTime fechaInicio,

            @NotNull LocalDateTime fechaFin,

            Integer idCategoria,

            @NotNull PrivacidadVotacion privacidad,

            @NotNull TipoVoto tipoVoto,

            @NotNull TipoSeleccion tipoSeleccion,

            @NotNull @Min(1) Integer maxSelecciones,

            @NotNull TipoGrafica tipoGrafica,

            @Min(1) @Max(120) Integer edadMinima,

            @NotNull Boolean comentariosPermitidos,

            @NotNull Boolean permiteCambioVoto,

            EstadoVotacion estado,

            List<@Valid SolicitudOpcion> opciones) {
    }

    public record RespuestaOpcion(
            Long idOpcion,
            String nombre,
            String imagenUrl,
            Integer ordenVisual) {
    }

    public record Respuesta(
            Long idVotacion,
            Long idCreador,
            String nombreCreador,
            Integer idCategoria,
            String categoria,
            String titulo,
            String descripcion,
            String imagenPortadaUrl,
            LocalDateTime fechaInicio,
            LocalDateTime fechaFin,
            EstadoVotacion estado,
            PrivacidadVotacion privacidad,
            TipoVoto tipoVoto,
            TipoSeleccion tipoSeleccion,
            Integer maxSelecciones,
            TipoGrafica tipoGrafica,
            Integer edadMinima,
            Boolean comentariosPermitidos,
            Boolean permiteCambioVoto,
            long totalVotos,
            List<RespuestaOpcion> opciones) {
    }
}