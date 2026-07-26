package com.votaya.votaya_backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.votaya.votaya_backend.model.Comentario;

import java.util.List;

public interface ComentarioRepositorio
        extends JpaRepository<Comentario, Long> {

    List<Comentario>
    findByVotacionIdVotacionOrderByFechaCreacionDesc(Long idVotacion);
}