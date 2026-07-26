package com.votaya.votaya_backend.security;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class FiltroJwt extends OncePerRequestFilter {

    private final UtilidadJwt utilidadJwt;
    private final ServicioDetallesUsuario servicioDetallesUsuario;

    @Override
    protected void doFilterInternal(
            HttpServletRequest solicitud,
            HttpServletResponse respuesta,
            FilterChain cadena
    ) throws ServletException, IOException {

        String encabezado =
                solicitud.getHeader("Authorization");

        if (encabezado == null
                || !encabezado.startsWith("Bearer ")) {

            cadena.doFilter(solicitud, respuesta);
            return;
        }

        String token = encabezado.substring(7);

        try {
            String correo = utilidadJwt.obtenerCorreo(token);

            if (correo != null
                    && SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

                UserDetails usuario =
                        servicioDetallesUsuario
                                .loadUserByUsername(correo);

                if (utilidadJwt.esValido(token, usuario)) {
                    UsernamePasswordAuthenticationToken autenticacion =
                            new UsernamePasswordAuthenticationToken(
                                    usuario,
                                    null,
                                    usuario.getAuthorities()
                            );

                    autenticacion.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(solicitud)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(autenticacion);
                }
            }
        } catch (JwtException | IllegalArgumentException excepcion) {
            SecurityContextHolder.clearContext();
        }

        cadena.doFilter(solicitud, respuesta);
    }
}