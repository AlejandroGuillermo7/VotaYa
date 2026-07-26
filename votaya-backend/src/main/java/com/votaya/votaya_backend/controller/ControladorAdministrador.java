package com.votaya.votaya_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import com.votaya.votaya_backend.dto.UsuarioDTO;
import com.votaya.votaya_backend.service.ServicioUsuario;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class ControladorAdministrador {

    private final ServicioUsuario servicioUsuario;

    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioDTO.Respuesta>>
    listarUsuarios() {
        return ResponseEntity.ok(
                servicioUsuario.listarTodos()
        );
    }

    @DeleteMapping("/usuarios/{idUsuario}")
    public ResponseEntity<Void> eliminarUsuario(
            @PathVariable Long idUsuario
    ) {
        servicioUsuario.eliminarLogicamente(idUsuario);
        return ResponseEntity.noContent().build();
    }
}