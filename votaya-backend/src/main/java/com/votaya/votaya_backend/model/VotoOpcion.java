package com.votaya.votaya_backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "voto_opcion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VotoOpcion {

    @EmbeddedId
    private VotoOpcionID id;

    @Column(name = "id_votacion", nullable = false)
    private Long idVotacion;
}