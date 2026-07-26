package com.votaya.votaya_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.votaya.votaya_backend.Excepciones.RecursoNoEncontradoExcepcion;
import com.votaya.votaya_backend.Excepciones.ReglaNegocioExcepcion;
import com.votaya.votaya_backend.Repository.CategoriaRepositorio;
import com.votaya.votaya_backend.dto.CategoriaDTO;
import com.votaya.votaya_backend.model.Categoria;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicioCategoria {

    private final CategoriaRepositorio categoriaRepositorio;

    public List<CategoriaDTO.Respuesta> listar() {
        return categoriaRepositorio.findAll()
                .stream()
                .map(this::convertir)
                .toList();
    }

    @Transactional
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public CategoriaDTO.Respuesta crear(
            CategoriaDTO.Solicitud solicitud
    ) {
        if (categoriaRepositorio
                .existsByNombreIgnoreCase(solicitud.nombre())) {
            throw new ReglaNegocioExcepcion(
                    "La categoría ya existe"
            );
        }

        Categoria categoria = Categoria.builder()
                .nombre(solicitud.nombre().trim())
                .descripcion(limpiar(solicitud.descripcion()))
                .build();

        return convertir(
                categoriaRepositorio.save(categoria)
        );
    }

    @Transactional
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public CategoriaDTO.Respuesta actualizar(
            Integer idCategoria,
            CategoriaDTO.Solicitud solicitud
    ) {
        Categoria categoria = buscar(idCategoria);

        categoria.setNombre(solicitud.nombre().trim());
        categoria.setDescripcion(
                limpiar(solicitud.descripcion())
        );

        return convertir(
                categoriaRepositorio.save(categoria)
        );
    }

    @Transactional
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public void eliminar(Integer idCategoria) {
        categoriaRepositorio.delete(buscar(idCategoria));
    }

    public Categoria buscar(Integer idCategoria) {
        return categoriaRepositorio
                .findById(idCategoria)
                .orElseThrow(() ->
                        new RecursoNoEncontradoExcepcion(
                                "Categoría no encontrada"
                        )
                );
    }

    private CategoriaDTO.Respuesta convertir(
            Categoria categoria
    ) {
        return new CategoriaDTO.Respuesta(
                categoria.getIdCategoria(),
                categoria.getNombre(),
                categoria.getDescripcion()
        );
    }

    private String limpiar(String valor) {
        return valor == null || valor.isBlank()
                ? null
                : valor.trim();
    }
}