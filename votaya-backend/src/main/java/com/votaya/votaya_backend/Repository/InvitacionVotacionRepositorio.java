package com.votaya.votaya_backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.votaya.votaya_backend.enumeraciones.EstadoInvitacion;
import com.votaya.votaya_backend.model.InvitacionVotacion;

import java.util.List;
import java.util.Optional;

public interface InvitacionVotacionRepositorio
        extends JpaRepository<InvitacionVotacion, Long> {

    boolean existsByVotacionIdVotacionAndUsuarioIdUsuarioAndEstado(
            Long idVotacion,
            Long idUsuario,
            EstadoInvitacion estado
    );

    boolean existsByVotacionIdVotacionAndUsuarioIdUsuario(
            Long idVotacion,
            Long idUsuario
    );

    Optional<InvitacionVotacion>
    findByVotacionIdVotacionAndUsuarioIdUsuario(
            Long idVotacion,
            Long idUsuario
    );

    List<InvitacionVotacion>
    findByUsuarioIdUsuarioAndEstado(
            Long idUsuario,
            EstadoInvitacion estado
    );
}