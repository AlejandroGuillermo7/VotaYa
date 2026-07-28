package com.votaya.votaya_backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ServicioArchivos {

    private static final Set<String> EXTENSIONES_PERMITIDAS =
            Set.of(".jpg", ".jpeg", ".png", ".webp", ".jfif", ".pjpeg", ".avif");

    private final Path carpetaImagenes =
            Paths.get("uploads", "imagenes")
                    .toAbsolutePath()
                    .normalize();

    public ServicioArchivos() {
        try {
            Files.createDirectories(carpetaImagenes);

            System.out.println(
                    "Carpeta de imágenes: " + carpetaImagenes
            );
        } catch (IOException excepcion) {
            throw new IllegalStateException(
                    "No se pudo crear la carpeta de imágenes.",
                    excepcion
            );
        }
    }

    public String guardarImagen(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            return null;
        }

        String tipoContenido = archivo.getContentType();

        if (tipoContenido == null ||
                !tipoContenido.startsWith("image/")) {

            throw new IllegalArgumentException(
                    "El archivo seleccionado no es una imagen válida."
            );
        }

        String nombreOriginal = archivo.getOriginalFilename();
        String extension = obtenerExtension(nombreOriginal);

        if (!EXTENSIONES_PERMITIDAS.contains(extension)) {
            throw new IllegalArgumentException(
                    "Solo se permiten imágenes JPG, JPEG, PNG, WEBP o JFIF."
            );
        }

        String nombreArchivo =
                UUID.randomUUID() + extension;

        Path destino = carpetaImagenes
                .resolve(nombreArchivo)
                .normalize();

        if (!destino.startsWith(carpetaImagenes)) {
            throw new IllegalArgumentException(
                    "La ruta del archivo no es válida."
            );
        }

        try {
            Files.copy(
                    archivo.getInputStream(),
                    destino,
                    StandardCopyOption.REPLACE_EXISTING
            );
        } catch (IOException excepcion) {
            throw new IllegalStateException(
                    "No se pudo guardar la imagen.",
                    excepcion
            );
        }

        return "/imagenes/" + nombreArchivo;
    }

    private String obtenerExtension(String nombreArchivo) {
        if (nombreArchivo == null ||
                !nombreArchivo.contains(".")) {

            return "";
        }

        return nombreArchivo
                .substring(nombreArchivo.lastIndexOf("."))
                .toLowerCase(Locale.ROOT);
    }
}