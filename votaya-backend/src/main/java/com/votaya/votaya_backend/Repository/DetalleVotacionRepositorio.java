package com.votaya.votaya_backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.votaya.votaya_backend.dto.DetalleParticipanteProyeccion;
import com.votaya.votaya_backend.model.Voto;

public interface DetalleVotacionRepositorio extends JpaRepository<Voto, Long> {

    /*
     * Para elecciones identificadas sí se puede relacionar al usuario
     * con la opción seleccionada.
     *
     * GROUP_CONCAT permite mostrar en una sola fila varias opciones
     * cuando la elección es de selección múltiple.
     */
    @Query(value = """
            SELECT
                u.id_usuario AS idUsuario,
                CONCAT_WS(
                    ' ',
                    u.nombres,
                    u.apellido_paterno,
                    NULLIF(u.apellido_materno, '')
                ) AS nombreCompleto,
                u.correo AS correo,
                u.foto_url AS fotoUrl,
                v.fecha_emision AS fechaVoto,
                GROUP_CONCAT(
                    ov.nombre
                    ORDER BY ov.orden_visual
                    SEPARATOR ', '
                ) AS opcionSeleccionada
            FROM voto v
            INNER JOIN usuario u
                ON u.id_usuario = v.id_usuario
            LEFT JOIN voto_opcion vo
                ON vo.id_voto = v.id_voto
                AND vo.id_votacion = v.id_votacion
            LEFT JOIN opcion_votacion ov
                ON ov.id_opcion = vo.id_opcion
                AND ov.id_votacion = vo.id_votacion
            WHERE v.id_votacion = :idVotacion
                AND v.id_usuario IS NOT NULL
            GROUP BY
                v.id_voto,
                u.id_usuario,
                u.nombres,
                u.apellido_paterno,
                u.apellido_materno,
                u.correo,
                u.foto_url,
                v.fecha_emision
            ORDER BY v.fecha_emision DESC
            """, nativeQuery = true)
    List<DetalleParticipanteProyeccion> obtenerVotosIdentificados(
            @Param("idVotacion") Long idVotacion
    );

    /*
     * En una elección anónima la tabla voto no conserva id_usuario.
     * Por eso se consulta participacion para mostrar quién participó,
     * pero nunca la opción elegida.
     */
    @Query(value = """
            SELECT
                u.id_usuario AS idUsuario,
                CONCAT_WS(
                    ' ',
                    u.nombres,
                    u.apellido_paterno,
                    NULLIF(u.apellido_materno, '')
                ) AS nombreCompleto,
                u.correo AS correo,
                u.foto_url AS fotoUrl,
                COALESCE(p.fecha_voto, p.fecha_registro) AS fechaVoto,
                'Voto anónimo' AS opcionSeleccionada
            FROM participacion p
            INNER JOIN usuario u
                ON u.id_usuario = p.id_usuario
            WHERE p.id_votacion = :idVotacion
                AND p.fecha_voto IS NOT NULL
            ORDER BY p.fecha_voto DESC
            """, nativeQuery = true)
    List<DetalleParticipanteProyeccion> obtenerParticipantesAnonimos(
            @Param("idVotacion") Long idVotacion
    );
}
