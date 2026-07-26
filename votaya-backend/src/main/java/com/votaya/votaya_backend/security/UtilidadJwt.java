package com.votaya.votaya_backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.votaya.votaya_backend.model.Usuario;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class UtilidadJwt {

    @Value("${jwt.secreto}")
    private String secreto;

    @Value("${jwt.expiracion-milisegundos}")
    private long expiracionMilisegundos;

    public String generarToken(Usuario usuario) {
        Date fechaActual = new Date();
        Date fechaExpiracion =
                new Date(fechaActual.getTime() + expiracionMilisegundos);

        return Jwts.builder()
                .subject(usuario.getCorreo())
                .claim("idUsuario", usuario.getIdUsuario())
                .claim("rol", usuario.getRol().name())
                .issuedAt(fechaActual)
                .expiration(fechaExpiracion)
                .signWith(obtenerClave())
                .compact();
    }

    public String obtenerCorreo(String token) {
        return obtenerClaims(token).getSubject();
    }

    public boolean esValido(
            String token,
            UserDetails usuario
    ) {
        String correo = obtenerCorreo(token);

        return correo.equalsIgnoreCase(usuario.getUsername())
                && obtenerClaims(token)
                .getExpiration()
                .after(new Date());
    }

    private Claims obtenerClaims(String token) {
        return Jwts.parser()
                .verifyWith(obtenerClave())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey obtenerClave() {
        byte[] bytes = Decoders.BASE64.decode(secreto);
        return Keys.hmacShaKeyFor(bytes);
    }
}