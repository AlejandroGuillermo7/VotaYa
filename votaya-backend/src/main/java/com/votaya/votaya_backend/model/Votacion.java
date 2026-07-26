package com.votaya.votaya_backend.model;

import com.votaya.votaya_backend.enumeraciones.*;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "votacion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Votacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_votacion")
    private Long idVotacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_creador", nullable = false)
    private Usuario creador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria")
    private Categoria categoria;

    @Column(nullable = false, length = 180)
    private String titulo;

    @Column(length = 600)
    private String descripcion;

    @Column(name = "imagen_portada_url", length = 500)
    private String imagenPortadaUrl;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDateTime fechaFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EstadoVotacion estado = EstadoVotacion.BORRADOR;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PrivacidadVotacion privacidad = PrivacidadVotacion.PUBLICA;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_voto", nullable = false)
    @Builder.Default
    private TipoVoto tipoVoto = TipoVoto.ANONIMO;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_seleccion", nullable = false)
    @Builder.Default
    private TipoSeleccion tipoSeleccion = TipoSeleccion.UNICA;

    @Column(name = "max_selecciones", nullable = false)
    @Builder.Default
    private Integer maxSelecciones = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_grafica", nullable = false)
    @Builder.Default
    private TipoGrafica tipoGrafica = TipoGrafica.BARRAS;

    @Column(name = "edad_minima")
    private Integer edadMinima;

    @Column(name = "comentarios_permitidos", nullable = false)
    @Builder.Default
    private Boolean comentariosPermitidos = false;

    @Column(name = "permite_cambio_voto", nullable = false)
    @Builder.Default
    private Boolean permiteCambioVoto = false;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    public void antesDeGuardar() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
    }
}