package com.votaya.votaya_backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import com.votaya.votaya_backend.Repository.UsuarioRepositorio;

@Service
@RequiredArgsConstructor
public class ServicioDetallesUsuario implements UserDetailsService {

    private final UsuarioRepositorio usuarioRepositorio;

    @Override
    public UserDetails loadUserByUsername(String correo)
            throws UsernameNotFoundException {

        return usuarioRepositorio
                .findByCorreoIgnoreCase(correo)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Usuario no encontrado"
                        )
                );
    }
}