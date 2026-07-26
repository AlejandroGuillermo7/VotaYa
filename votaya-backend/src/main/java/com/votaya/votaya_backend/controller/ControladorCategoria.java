package com.votaya.votaya_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import com.votaya.votaya_backend.dto.CategoriaDTO;
import com.votaya.votaya_backend.service.ServicioCategoria;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class ControladorCategoria {

    private final ServicioCategoria servicioCategoria;

    @GetMapping
    public ResponseEntity<List<CategoriaDTO.Respuesta>> listar() {
        return ResponseEntity.ok(
                servicioCategoria.listar());
    }

    @PostMapping
    public ResponseEntity<CategoriaDTO.Respuesta> crear(
            @Valid @RequestBody CategoriaDTO.Solicitud solicitud) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(servicioCategoria.crear(solicitud));
    }

    @PutMapping("/{idCategoria}")
    public ResponseEntity<CategoriaDTO.Respuesta> actualizar(
            @PathVariable Integer idCategoria,
            @Valid @RequestBody CategoriaDTO.Solicitud solicitud) {
        return ResponseEntity.ok(
                servicioCategoria.actualizar(
                        idCategoria,
                        solicitud));
    }

    @DeleteMapping("/{idCategoria}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Integer idCategoria) {
        servicioCategoria.eliminar(idCategoria);
        return ResponseEntity.noContent().build();
    }
}