package com.votaya.votaya_backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.votaya.votaya_backend.model.TokenRecuperacion;

import java.util.Optional;

public interface TokenRecuperacionRepositorio
        extends JpaRepository<TokenRecuperacion, Long> {

    Optional<TokenRecuperacion>
    findByTokenHashAndUtilizadoFalse(String tokenHash);
}