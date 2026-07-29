package com.votaya.votaya_backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.votaya.votaya_backend.model.Voto;

import java.util.Optional;

public interface VotoRepositorio extends JpaRepository<Voto, Long> {

    Optional<Voto> findByVotacionIdVotacionAndUsuarioIdUsuario(
            Long idVotacion,
            Long idUsuario
    );

    Optional<Voto> findByVotacionIdVotacionAndTokenCambioHash(
            Long idVotacion,
            String tokenCambioHash
    );

    long countByVotacionIdVotacion(Long idVotacion);
}