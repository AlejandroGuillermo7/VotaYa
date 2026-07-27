package com.votaya.votaya_backend.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ConfiguracionArchivos
        implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry
    ) {
        Path carpetaImagenes =
                Paths.get("uploads", "imagenes")
                        .toAbsolutePath()
                        .normalize();

        registry
                .addResourceHandler("/imagenes/**")
                .addResourceLocations(
                        carpetaImagenes.toUri().toString()
                );
    }
}