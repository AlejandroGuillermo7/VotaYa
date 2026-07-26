package com.votaya.votaya_backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.votaya.votaya_backend.model.OpcionVotacion;

import java.util.Collection;
import java.util.List;

public interface OpcionVotacionRepositorio
        extends JpaRepository<OpcionVotacion, Long> {

    List<OpcionVotacion>
    findByVotacionIdVotacionOrderByOrdenVisualAsc(Long idVotacion);

    List<OpcionVotacion>
    findByIdOpcionInAndVotacionIdVotacion(
            Collection<Long> idsOpciones,
            Long idVotacion
    );

    void deleteByVotacionIdVotacion(Long idVotacion);

    @Query(
        value = """
            SELECT
                o.id_opcion,
                o.nombre,
                COUNT(vo.id_voto) AS total_votos
            FROM opcion_votacion o
            LEFT JOIN voto_opcion vo
                ON vo.id_opcion = o.id_opcion
               AND vo.id_votacion = o.id_votacion
            WHERE o.id_votacion = :idVotacion
            GROUP BY o.id_opcion, o.nombre, o.orden_visual
            ORDER BY total_votos DESC, o.orden_visual ASC
            """,
        nativeQuery = true
    )
    List<Object[]> obtenerResultados(
            @Param("idVotacion") Long idVotacion
    );
}