package com.votaya.votaya_backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "voto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_voto")
    private Long idVoto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_votacion", nullable = false)
    private Votacion votacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(name = "folio_publico", nullable = false, unique = true, length = 36)
    private String folioPublico;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDateTime fechaEmision;

    @Column(name = "token_cambio_hash", length = 255)
    private String tokenCambioHash;

    @PrePersist
    public void antesDeGuardar() {
        if (fechaEmision == null) {
            fechaEmision = LocalDateTime.now();
        }
    }
}