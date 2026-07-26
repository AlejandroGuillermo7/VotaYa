package com.votaya.votaya_backend.model;

import com.votaya.votaya_backend.enumeraciones.EstadoInvitacion;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "invitacion_votacion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvitacionVotacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_invitacion")
    private Long idInvitacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_votacion", nullable = false)
    private Votacion votacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EstadoInvitacion estado = EstadoInvitacion.PENDIENTE;

    @Column(name = "fecha_invitacion", nullable = false)
    private LocalDateTime fechaInvitacion;

    @Column(name = "fecha_respuesta")
    private LocalDateTime fechaRespuesta;

    @PrePersist
    public void antesDeGuardar() {
        if (fechaInvitacion == null) {
            fechaInvitacion = LocalDateTime.now();
        }
    }
}