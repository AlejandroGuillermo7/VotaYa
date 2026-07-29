package com.votaya.votaya_backend.dto;

import java.time.LocalDateTime;

public interface DetalleParticipanteProyeccion {

    Long getIdUsuario();

    String getNombreCompleto();

    String getCorreo();

    String getFotoUrl();

    LocalDateTime getFechaVoto();

    String getOpcionSeleccionada();
}
