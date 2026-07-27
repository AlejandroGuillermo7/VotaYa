package com.votaya.votaya_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.votaya.votaya_backend.dto.UsuarioDTO;
import com.votaya.votaya_backend.service.ServicioUsuario;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class ControladorUsuario {

    private final ServicioUsuario servicioUsuario;

    @GetMapping("/perfil")
    public ResponseEntity<UsuarioDTO.Respuesta> obtenerPerfil() {
        return ResponseEntity.ok(
                servicioUsuario.obtenerPerfil());
    }

    @PutMapping(value = "/perfil", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<UsuarioDTO.Respuesta> actualizarPerfil(
            @Valid @RequestPart("datos") UsuarioDTO.SolicitudActualizar solicitud,
            @RequestPart(value = "foto", required = false) MultipartFile foto) {

        String urlFoto = solicitud.fotoUrl(); 


        if (foto != null && !foto.isEmpty()) {
            try {
                String nombreArchivo = UUID.randomUUID().toString() + "_" + foto.getOriginalFilename();
                Path rutaDirectorio = Paths.get("src/main/resources/static/imagenes/");

                if (!Files.exists(rutaDirectorio)) {
                    Files.createDirectories(rutaDirectorio);
                }

                Path rutaCompleta = rutaDirectorio.resolve(nombreArchivo);
                Files.copy(foto.getInputStream(), rutaCompleta, StandardCopyOption.REPLACE_EXISTING);

                urlFoto = "http://localhost:8080/imagenes/" + nombreArchivo;

            } catch (IOException e) {
                throw new RuntimeException("Error al guardar la nueva foto de perfil", e);
            }
        }

        UsuarioDTO.SolicitudActualizar solicitudFinal = new UsuarioDTO.SolicitudActualizar(
                solicitud.nombres(),
                solicitud.apellidoPaterno(),
                solicitud.apellidoMaterno(),
                solicitud.fechaNacimiento(),
                urlFoto
        );

        return ResponseEntity.ok(
                servicioUsuario.actualizarPerfil(solicitudFinal)
        );
    }
}