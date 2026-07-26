package com.votaya.votaya_backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.votaya.votaya_backend.model.Categoria;

public interface CategoriaRepositorio extends JpaRepository<Categoria, Integer> {

    boolean existsByNombreIgnoreCase(String nombre);
}