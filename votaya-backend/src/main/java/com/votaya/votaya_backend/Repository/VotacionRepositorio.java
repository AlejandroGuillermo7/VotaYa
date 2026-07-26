package com.votaya.votaya_backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.votaya.votaya_backend.enumeraciones.EstadoVotacion;
import com.votaya.votaya_backend.enumeraciones.PrivacidadVotacion;
import com.votaya.votaya_backend.model.Votacion;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface VotacionRepositorio extends JpaRepository<Votacion, Long> {

    List<Votacion> findByCreadorIdUsuarioOrderByFechaCreacionDesc(
            Long idUsuario
    );

    @Query("""
        SELECT v
        FROM Votacion v
        WHERE v.privacidad = :privacidad
          AND v.estado NOT IN :estadosExcluidos
          AND v.fechaInicio <= :ahora
          AND v.fechaFin >= :ahora
        ORDER BY v.fechaCreacion DESC
        """)
    List<Votacion> buscarDisponibles(
            @Param("privacidad") PrivacidadVotacion privacidad,
            @Param("estadosExcluidos") Collection<EstadoVotacion> estadosExcluidos,
            @Param("ahora") LocalDateTime ahora
    );
}