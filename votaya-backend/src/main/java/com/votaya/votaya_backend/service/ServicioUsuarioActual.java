package com.votaya.votaya_backend.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.votaya.votaya_backend.Excepciones.RecursoNoEncontradoExcepcion;
import com.votaya.votaya_backend.Repository.UsuarioRepositorio;
import com.votaya.votaya_backend.model.Usuario;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ServicioUsuarioActual {

    private final UsuarioRepositorio usuarioRepositorio;

    public Usuario obtener() {
        Authentication autenticacion = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (autenticacion == null
                || !autenticacion.isAuthenticated()) {

            throw new RecursoNoEncontradoExcepcion(
                    "No existe un usuario autenticado"
            );
        }

        String correo = autenticacion.getName();

        return usuarioRepositorio
                .findByCorreoIgnoreCase(correo)
                .orElseThrow(() ->
                        new RecursoNoEncontradoExcepcion(
                                "Usuario autenticado no encontrado"
                        )
                );
    }
}