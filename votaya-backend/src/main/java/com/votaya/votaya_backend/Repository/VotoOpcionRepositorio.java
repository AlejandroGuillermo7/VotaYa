package com.votaya.votaya_backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.votaya.votaya_backend.model.VotoOpcion;
import com.votaya.votaya_backend.model.VotoOpcionID;

public interface VotoOpcionRepositorio
        extends JpaRepository<VotoOpcion, VotoOpcionID> {

    @Modifying
    @Query("""
        DELETE FROM VotoOpcion vo
        WHERE vo.id.idVoto = :idVoto
        """)
    void eliminarPorIdVoto(@Param("idVoto") Long idVoto);

    long countByIdVotacion(Long idVotacion);
}