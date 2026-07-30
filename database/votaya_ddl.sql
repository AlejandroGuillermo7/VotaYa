```sql
CREATE DATABASE IF NOT EXISTS votaya
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE votaya;


CREATE TABLE usuario (
    id_usuario BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(80) NOT NULL,
    apellido_materno VARCHAR(80),
    fecha_nacimiento DATE NOT NULL,
    correo VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    foto_url VARCHAR(500),

    rol ENUM(
        'USUARIO',
        'ADMINISTRADOR'
    ) NOT NULL DEFAULT 'USUARIO',

    estado ENUM(
        'ACTIVO',
        'ELIMINADO'
    ) NOT NULL DEFAULT 'ACTIVO',

    correo_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_usuario_correo
        UNIQUE (correo)
);


CREATE TABLE categoria (
    id_categoria SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    descripcion VARCHAR(250),
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_categoria_nombre
        UNIQUE (nombre)
);


CREATE TABLE votacion (
    id_votacion BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_creador BIGINT UNSIGNED NOT NULL,
    id_categoria SMALLINT UNSIGNED,

    titulo VARCHAR(180) NOT NULL,
    descripcion VARCHAR(600),
    imagen_portada_url VARCHAR(500),

    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,

    estado ENUM(
        'BORRADOR',
        'PROGRAMADA',
        'ACTIVA',
        'FINALIZADA',
        'CANCELADA'
    ) NOT NULL DEFAULT 'BORRADOR',

    privacidad ENUM(
        'PUBLICA',
        'PRIVADA'
    ) NOT NULL DEFAULT 'PUBLICA',

    tipo_voto ENUM(
        'ANONIMO',
        'IDENTIFICADO'
    ) NOT NULL DEFAULT 'ANONIMO',

    tipo_seleccion ENUM(
        'UNICA',
        'MULTIPLE'
    ) NOT NULL DEFAULT 'UNICA',

    max_selecciones TINYINT UNSIGNED NOT NULL DEFAULT 1,

    tipo_grafica ENUM(
        'BARRAS',
        'PASTEL'
    ) NOT NULL DEFAULT 'BARRAS',

    edad_minima TINYINT UNSIGNED,
    comentarios_permitidos BOOLEAN NOT NULL DEFAULT FALSE,
    permite_cambio_voto BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_votacion_creador
        FOREIGN KEY (id_creador)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_votacion_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);


CREATE TABLE opcion_votacion (
    id_opcion BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_votacion BIGINT UNSIGNED NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    imagen_url VARCHAR(500),

    orden_visual SMALLINT UNSIGNED NOT NULL,

    CONSTRAINT fk_opcion_votacion
        FOREIGN KEY (id_votacion)
        REFERENCES votacion(id_votacion)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uk_opcion_nombre
        UNIQUE (id_votacion, nombre),

    CONSTRAINT uk_opcion_orden
        UNIQUE (id_votacion, orden_visual),

    CONSTRAINT uk_opcion_id_votacion
        UNIQUE (id_opcion, id_votacion)
);


CREATE TABLE invitacion_votacion (
    id_invitacion BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_votacion BIGINT UNSIGNED NOT NULL,
    id_usuario BIGINT UNSIGNED NOT NULL,

    estado ENUM(
        'PENDIENTE',
        'ACEPTADA',
        'RECHAZADA',
        'REVOCADA'
    ) NOT NULL DEFAULT 'PENDIENTE',

    fecha_invitacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta DATETIME,

    CONSTRAINT fk_invitacion_votacion
        FOREIGN KEY (id_votacion)
        REFERENCES votacion(id_votacion)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_invitacion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uk_invitacion_usuario
        UNIQUE (id_votacion, id_usuario)
);


CREATE TABLE participacion (
    id_participacion BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_votacion BIGINT UNSIGNED NOT NULL,
    id_usuario BIGINT UNSIGNED NOT NULL,

    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_voto DATETIME,

    CONSTRAINT fk_participacion_votacion
        FOREIGN KEY (id_votacion)
        REFERENCES votacion(id_votacion)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_participacion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uk_participacion_usuario
        UNIQUE (id_votacion, id_usuario)
);


CREATE TABLE voto (
    id_voto BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_votacion BIGINT UNSIGNED NOT NULL,
    id_usuario BIGINT UNSIGNED NULL,

    folio_publico CHAR(36) NOT NULL,
    fecha_emision DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    token_cambio_hash VARCHAR(255) NULL,

    CONSTRAINT fk_voto_votacion
        FOREIGN KEY (id_votacion)
        REFERENCES votacion(id_votacion)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_voto_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uk_voto_folio
        UNIQUE (folio_publico),

    CONSTRAINT uk_voto_identificado
        UNIQUE (id_votacion, id_usuario),

    CONSTRAINT uk_voto_id_votacion
        UNIQUE (id_voto, id_votacion)
);


CREATE TABLE voto_opcion (
    id_voto BIGINT UNSIGNED NOT NULL,
    id_opcion BIGINT UNSIGNED NOT NULL,
    id_votacion BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (id_voto, id_opcion),

    CONSTRAINT fk_voto_opcion_voto
        FOREIGN KEY (id_voto, id_votacion)
        REFERENCES voto(id_voto, id_votacion)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_voto_opcion_opcion
        FOREIGN KEY (id_opcion, id_votacion)
        REFERENCES opcion_votacion(id_opcion, id_votacion)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


CREATE TABLE comentario (
    id_comentario BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_votacion BIGINT UNSIGNED NOT NULL,
    id_usuario BIGINT UNSIGNED NOT NULL,

    contenido VARCHAR(1000) NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comentario_votacion
        FOREIGN KEY (id_votacion)
        REFERENCES votacion(id_votacion)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_comentario_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


CREATE TABLE token_recuperacion (
    id_token BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT UNSIGNED NOT NULL,

    token_hash VARCHAR(255) NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion DATETIME NOT NULL,
    utilizado BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_token_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uk_token_hash
        UNIQUE (token_hash)
);


CREATE TABLE auditoria (
    id_auditoria BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT UNSIGNED NULL,

    accion VARCHAR(80) NOT NULL,
    entidad VARCHAR(80) NOT NULL,
    id_entidad BIGINT UNSIGNED,
    detalle JSON,

    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_auditoria_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);


ALTER TABLE usuario
ADD COLUMN telefono VARCHAR(20) NULL
AFTER foto_url;
```
