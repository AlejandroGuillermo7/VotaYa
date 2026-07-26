package com.votaya.votaya_backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class VotoOpcionID implements Serializable {

    @Column(name = "id_voto")
    private Long idVoto;

    @Column(name = "id_opcion")
    private Long idOpcion;
}