package com.votaya.votaya_backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.votaya.votaya_backend.dto.AutenticacionDTO;
import com.votaya.votaya_backend.service.ServicioAutenticacion;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class ControladorAutenticacion {

    private final ServicioAutenticacion servicioAutenticacion;

    @PostMapping(
            value = "/registro",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<AutenticacionDTO.Respuesta> registrar(
            @Valid
            @RequestPart("datos")
            AutenticacionDTO.SolicitudRegistro solicitud,

            @RequestPart(
                    value = "foto",
                    required = false
            )
            MultipartFile foto
    ) {
        String urlFoto = null;

        if (foto != null && !foto.isEmpty()) {
            try {
                String nombreOriginal =
                        foto.getOriginalFilename() == null
                                ? "foto"
                                : foto.getOriginalFilename();

                String nombreArchivo =
                        UUID.randomUUID()
                                + "_"
                                + nombreOriginal;

                Path rutaDirectorio =
                        Paths.get("uploads/imagenes/");

                Files.createDirectories(rutaDirectorio);

                Path rutaCompleta =
                        rutaDirectorio.resolve(nombreArchivo);

                Files.copy(
                        foto.getInputStream(),
                        rutaCompleta,
                        StandardCopyOption.REPLACE_EXISTING
                );

                urlFoto = "/imagenes/" + nombreArchivo;

            } catch (IOException excepcion) {
                throw new RuntimeException(
                        "Error al guardar la foto de perfil",
                        excepcion
                );
            }
        }

        AutenticacionDTO.SolicitudRegistro solicitudFinal =
                new AutenticacionDTO.SolicitudRegistro(
                        solicitud.nombres(),
                        solicitud.apellidoPaterno(),
                        solicitud.apellidoMaterno(),
                        solicitud.fechaNacimiento(),
                        solicitud.correo(),
                        solicitud.contrasena(),
                        urlFoto
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        servicioAutenticacion.registrar(
                                solicitudFinal
                        )
                );
    }

    @PostMapping("/login")
    public ResponseEntity<AutenticacionDTO.Respuesta> login(
            @Valid
            @RequestBody
            AutenticacionDTO.SolicitudLogin solicitud
    ) {
        return ResponseEntity.ok(
                servicioAutenticacion.iniciarSesion(
                        solicitud
                )
        );
    }

    @PostMapping("/google")
    public ResponseEntity<AutenticacionDTO.Respuesta> loginGoogle(
            @Valid
            @RequestBody
            AutenticacionDTO.SolicitudGoogle solicitud
    ) {
        return ResponseEntity.ok(
                servicioAutenticacion.iniciarSesionGoogle(
                        solicitud
                )
        );
    }
}