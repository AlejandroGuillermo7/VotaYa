package com.votaya.votaya_backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "opcion_votacion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpcionVotacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_opcion")
    private Long idOpcion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_votacion", nullable = false)
    private Votacion votacion;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(name = "imagen_url", length = 500)
    private String imagenUrl;

    @Column(name = "orden_visual", nullable = false)
    private Integer ordenVisual;
}