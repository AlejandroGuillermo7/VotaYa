package com.votaya.votaya_backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.*;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

import com.votaya.votaya_backend.security.FiltroJwt;

import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class ConfiguracionSeguridad {

    private final FiltroJwt filtroJwt;

    @Bean
    public SecurityFilterChain cadenaSeguridad(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(configuracion -> configuracion.disable())

                .cors(configuracion ->
                        configuracion.configurationSource(
                                fuenteConfiguracionCors()
                        )
                )

                .sessionManagement(configuracion ->
                        configuracion.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(autorizacion ->
                        autorizacion
                                .requestMatchers(
                                        "/api/auth/**",
                                        "/api/recuperacion/**",
                                        "/imagenes/**"
                                )
                                .permitAll()

                                .requestMatchers(HttpMethod.OPTIONS, "/**")
                                .permitAll()

                                .requestMatchers("/api/admin/**")
                                .hasRole("ADMINISTRADOR")

                                .anyRequest()
                                .authenticated()
                )

                .exceptionHandling(configuracion ->
                        configuracion

                                .authenticationEntryPoint(
                                        (solicitud, respuesta, excepcion) -> {
                                            respuesta.setStatus(401);
                                            respuesta.setContentType(
                                                    "application/json"
                                            );
                                            respuesta.getWriter().write(
                                                    """
                                                    {
                                                      "mensaje": "Debes iniciar sesión"
                                                    }
                                                    """
                                            );
                                        }
                                )

                                .accessDeniedHandler(
                                        (solicitud, respuesta, excepcion) -> {
                                            respuesta.setStatus(403);
                                            respuesta.setContentType(
                                                    "application/json"
                                            );
                                            respuesta.getWriter().write(
                                                    """
                                                    {
                                                      "mensaje": "No tienes permisos"
                                                    }
                                                    """
                                            );
                                        }
                                )
                )

                .addFilterBefore(
                        filtroJwt,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder codificadorContrasena() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager administradorAutenticacion(
            AuthenticationConfiguration configuracion
    ) throws Exception {
        return configuracion.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource fuenteConfiguracionCors() {
        CorsConfiguration configuracion =
                new CorsConfiguration();

        configuracion.setAllowedOrigins(
                List.of(
                        "http://localhost:5173",
                        "https://votaya.com.mx",
                        "https://www.votaya.com.mx"
                )
        );

        configuracion.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuracion.setAllowedHeaders(
                List.of("*")
        );

        configuracion.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource fuente =
                new UrlBasedCorsConfigurationSource();

        fuente.registerCorsConfiguration(
                "/**",
                configuracion
        );

        return fuente;
    }
}