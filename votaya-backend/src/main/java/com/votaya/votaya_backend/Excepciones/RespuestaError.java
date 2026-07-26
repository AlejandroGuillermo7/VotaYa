package com.votaya.votaya_backend.Excepciones;

import java.time.LocalDateTime;

public record RespuestaError(
        LocalDateTime fecha,
        int estado,
        String error,
        String mensaje) {
}