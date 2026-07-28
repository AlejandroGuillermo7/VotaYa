package com.votaya.votaya_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.votaya.votaya_backend.dto.VotacionDTO;
import com.votaya.votaya_backend.service.ServicioArchivos;
import com.votaya.votaya_backend.service.ServicioVotacion;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/votaciones")
@RequiredArgsConstructor
public class ControladorVotacion {

    private final ServicioVotacion servicioVotacion;
    private final ServicioArchivos servicioArchivos;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<VotacionDTO.Respuesta> crearJson(
            @Valid @RequestBody VotacionDTO.SolicitudGuardar solicitud) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(servicioVotacion.crear(solicitud));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VotacionDTO.Respuesta> crearConImagen(
            @Valid
            @RequestPart("votacion")
            VotacionDTO.SolicitudGuardar solicitud,

            @RequestPart(
                    value = "imagenPortada",
                    required = false
            )
            MultipartFile imagenPortada) {

        String rutaPortada =
                servicioArchivos.guardarImagen(imagenPortada);

        VotacionDTO.SolicitudGuardar solicitudConImagen =
                new VotacionDTO.SolicitudGuardar(
                        solicitud.titulo(),
                        solicitud.descripcion(),
                        rutaPortada,
                        solicitud.fechaInicio(),
                        solicitud.fechaFin(),
                        solicitud.idCategoria(),
                        solicitud.privacidad(),
                        solicitud.tipoVoto(),
                        solicitud.tipoSeleccion(),
                        solicitud.maxSelecciones(),
                        solicitud.tipoGrafica(),
                        solicitud.edadMinima(),
                        solicitud.comentariosPermitidos(),
                        solicitud.permiteCambioVoto(),
                        solicitud.estado(),
                        solicitud.opciones()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        servicioVotacion.crear(
                                solicitudConImagen
                        )
                );
    }

    @GetMapping("/disponibles")
    public ResponseEntity<List<VotacionDTO.Respuesta>> listarDisponibles() {
        return ResponseEntity.ok(
                servicioVotacion.listarDisponibles()
        );
    }

    @GetMapping("/mias")
    public ResponseEntity<List<VotacionDTO.Respuesta>> listarMias() {
        return ResponseEntity.ok(
                servicioVotacion.listarMias()
        );
    }

    @GetMapping("/{idVotacion}")
    public ResponseEntity<VotacionDTO.Respuesta> obtenerDetalle(
            @PathVariable Long idVotacion) {

        return ResponseEntity.ok(
                servicioVotacion.obtenerDetalle(
                        idVotacion
                )
        );
    }

    @PutMapping("/{idVotacion}")
    public ResponseEntity<VotacionDTO.Respuesta> actualizar(
            @PathVariable Long idVotacion,
            @Valid
            @RequestBody
            VotacionDTO.SolicitudGuardar solicitud) {

        return ResponseEntity.ok(
                servicioVotacion.actualizar(
                        idVotacion,
                        solicitud
                )
        );
    }

    @PatchMapping("/{idVotacion}/cancelar")
    public ResponseEntity<Void> cancelar(
            @PathVariable Long idVotacion) {

        servicioVotacion.cancelar(idVotacion);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{idVotacion}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long idVotacion) {

        servicioVotacion.eliminar(idVotacion);

        return ResponseEntity.noContent().build();
    }
}
