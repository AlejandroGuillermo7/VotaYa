package com.votaya.votaya_backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.votaya.votaya_backend.model.Participacion;

import java.util.List;

public interface ParticipacionRepositorio
        extends JpaRepository<Participacion, Long> {

    boolean existsByVotacionIdVotacionAndUsuarioIdUsuario(
            Long idVotacion,
            Long idUsuario
    );

    List<Participacion>
    findByUsuarioIdUsuarioOrderByFechaVotoDesc(Long idUsuario);
}