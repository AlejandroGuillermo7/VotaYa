package com.votaya.votaya_backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.votaya.votaya_backend.model.Auditoria;

public interface AuditoriaRepositorio
        extends JpaRepository<Auditoria, Long> {
}