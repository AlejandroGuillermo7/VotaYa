package com.votaya.votaya_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.votaya.votaya_backend.Excepciones.RecursoNoEncontradoExcepcion;
import com.votaya.votaya_backend.Repository.UsuarioRepositorio;
import com.votaya.votaya_backend.model.Usuario;

@Service
@RequiredArgsConstructor
public class ServicioUsuarioActual {

    private final UsuarioRepositorio usuarioRepositorio;

    public Usuario obtener() {
        String correo = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return usuarioRepositorio
                .findByCorreoIgnoreCase(correo)
                .orElseThrow(() ->
                        new RecursoNoEncontradoExcepcion(
                                "Usuario autenticado no encontrado"
                        )
                );
    }
}