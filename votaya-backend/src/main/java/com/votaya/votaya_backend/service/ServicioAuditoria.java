package com.votaya.votaya_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.votaya.votaya_backend.Repository.AuditoriaRepositorio;
import com.votaya.votaya_backend.model.Auditoria;
import com.votaya.votaya_backend.model.Usuario;

@Service
@RequiredArgsConstructor
public class ServicioAuditoria {

    private final AuditoriaRepositorio auditoriaRepositorio;

    public void registrar(
            Usuario usuario,
            String accion,
            String entidad,
            Long idEntidad,
            String detalle) {
        Auditoria auditoria = Auditoria.builder()
                .usuario(usuario)
                .accion(accion)
                .entidad(entidad)
                .idEntidad(idEntidad)
                .detalle(detalle)
                .build();

        auditoriaRepositorio.save(auditoria);
    }
}