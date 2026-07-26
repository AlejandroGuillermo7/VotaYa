package com.votaya.votaya_backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.votaya.votaya_backend.enumeraciones.EstadoVotacion;
import com.votaya.votaya_backend.enumeraciones.PrivacidadVotacion;
import com.votaya.votaya_backend.model.Votacion;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface VotacionRepositorio
        extends JpaRepository<Votacion, Long> {

    List<Votacion>
    findByCreadorIdUsuarioOrderByFechaCreacionDesc(
            Long idUsuario
    );

    List<Votacion>
    findByPrivacidadAndEstadoNotInAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqualOrderByFechaCreacionDesc(
            PrivacidadVotacion privacidad,
            Collection<EstadoVotacion> estadosExcluidos,
            LocalDateTime fechaInicio,
            LocalDateTime fechaFin
    );
}