package com.votaya.votaya_backend.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

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
    public ResponseEntity<VotacionDTO.Respuesta> crearConImagenes(
            @Valid
            @RequestPart("votacion")
            VotacionDTO.SolicitudGuardar solicitud,

            @RequestPart(
                    value = "imagenPortada",
                    required = false
            )
            MultipartFile imagenPortada,

            MultipartHttpServletRequest peticion) {

        VotacionDTO.SolicitudGuardar solicitudPreparada =
                prepararSolicitudConImagenes(
                        solicitud,
                        imagenPortada,
                        peticion
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(servicioVotacion.crear(solicitudPreparada));
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
                servicioVotacion.obtenerDetalle(idVotacion)
        );
    }

    @PutMapping(
            value = "/{idVotacion}",
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<VotacionDTO.Respuesta> actualizarJson(
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

    @PutMapping(
            value = "/{idVotacion}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<VotacionDTO.Respuesta> actualizarConImagenes(
            @PathVariable Long idVotacion,

            @Valid
            @RequestPart("votacion")
            VotacionDTO.SolicitudGuardar solicitud,

            @RequestPart(
                    value = "imagenPortada",
                    required = false
            )
            MultipartFile imagenPortada,

            MultipartHttpServletRequest peticion) {

        VotacionDTO.SolicitudGuardar solicitudPreparada =
                prepararSolicitudConImagenes(
                        solicitud,
                        imagenPortada,
                        peticion
                );

        return ResponseEntity.ok(
                servicioVotacion.actualizar(
                        idVotacion,
                        solicitudPreparada
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

    private VotacionDTO.SolicitudGuardar prepararSolicitudConImagenes(
            VotacionDTO.SolicitudGuardar solicitud,
            MultipartFile imagenPortada,
            MultipartHttpServletRequest peticion) {

        String rutaPortada = solicitud.imagenPortadaUrl();

        if (imagenPortada != null && !imagenPortada.isEmpty()) {
            rutaPortada =
                    servicioArchivos.guardarImagen(imagenPortada);
        }

        List<VotacionDTO.SolicitudOpcion> opcionesPreparadas =
                new ArrayList<>();

        if (solicitud.opciones() != null) {
            for (int indice = 0;
                 indice < solicitud.opciones().size();
                 indice++) {

                VotacionDTO.SolicitudOpcion opcion =
                        solicitud.opciones().get(indice);

                MultipartFile imagenOpcion =
                        peticion.getFile(
                                "imagenOpcion_" + indice
                        );

                String rutaImagenOpcion =
                        opcion.imagenUrl();

                if (imagenOpcion != null &&
                        !imagenOpcion.isEmpty()) {

                    rutaImagenOpcion =
                            servicioArchivos.guardarImagen(
                                    imagenOpcion
                            );
                }

                opcionesPreparadas.add(
                        new VotacionDTO.SolicitudOpcion(
                                opcion.nombre(),
                                rutaImagenOpcion
                        )
                );
            }
        }

        return new VotacionDTO.SolicitudGuardar(
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
                opcionesPreparadas
        );
    }
}