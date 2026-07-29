package com.votaya.votaya_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.votaya.votaya_backend.dto.AutenticacionDTO;
import com.votaya.votaya_backend.service.ServicioAutenticacion;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class ControladorAutenticacion {

    private final ServicioAutenticacion servicioAutenticacion;

    @PostMapping(value = "/registro", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<AutenticacionDTO.Respuesta> registrar(
            @Valid @RequestPart("datos") AutenticacionDTO.SolicitudRegistro solicitud,
            @RequestPart(value = "foto", required = false) MultipartFile foto
    ) {
        String urlFoto = null;


        if (foto != null && !foto.isEmpty()) {
            try {
                String nombreArchivo = UUID.randomUUID().toString() + "_" +foto.getOriginalFilename();
                Path rutaDirectorio = Paths.get("uploads/imagenes/");
                
                if (!Files.exists(rutaDirectorio)) {
                    Files.createDirectories(rutaDirectorio);
                }

                Path rutaCompleta = rutaDirectorio.resolve(nombreArchivo);
                Files.copy(foto.getInputStream(), rutaCompleta, StandardCopyOption.REPLACE_EXISTING);

                urlFoto = "/imagenes/" + nombreArchivo;

            } catch (IOException e) {
                throw new RuntimeException("Error al guardar la foto de perfil en el servidor", e);
            }
        }

        AutenticacionDTO.SolicitudRegistro solicitudFinal = new AutenticacionDTO.SolicitudRegistro(
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
                .body(servicioAutenticacion.registrar(solicitudFinal));
    }

    @PostMapping("/login")
    public ResponseEntity<AutenticacionDTO.Respuesta> login(
            @Valid @RequestBody AutenticacionDTO.SolicitudLogin solicitud
    ) {
        return ResponseEntity.ok(
                servicioAutenticacion.iniciarSesion(solicitud)
        );
    }
}