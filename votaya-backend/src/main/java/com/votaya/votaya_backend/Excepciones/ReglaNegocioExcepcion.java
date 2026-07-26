package com.votaya.votaya_backend.Excepciones;

public class ReglaNegocioExcepcion extends RuntimeException {

    public ReglaNegocioExcepcion(String mensaje) {
        super(mensaje);
    }
}