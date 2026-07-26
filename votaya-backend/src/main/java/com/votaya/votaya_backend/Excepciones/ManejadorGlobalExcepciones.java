package com.votaya.votaya_backend.Excepciones;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ManejadorGlobalExcepciones {

    @ExceptionHandler(RecursoNoEncontradoExcepcion.class)
    public ResponseEntity<RespuestaError> manejarNoEncontrado(
            RecursoNoEncontradoExcepcion excepcion
    ) {
        return crearRespuesta(
                HttpStatus.NOT_FOUND,
                excepcion.getMessage()
        );
    }

    @ExceptionHandler(ReglaNegocioExcepcion.class)
    public ResponseEntity<RespuestaError> manejarReglaNegocio(
            ReglaNegocioExcepcion excepcion
    ) {
        return crearRespuesta(
                HttpStatus.BAD_REQUEST,
                excepcion.getMessage()
        );
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<RespuestaError> manejarCredenciales() {
        return crearRespuesta(
                HttpStatus.UNAUTHORIZED,
                "Correo o contraseña incorrectos"
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<RespuestaError> manejarAccesoDenegado(
            AccessDeniedException excepcion
    ) {
        return crearRespuesta(
                HttpStatus.FORBIDDEN,
                excepcion.getMessage()
        );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<RespuestaError> manejarDuplicado() {
        return crearRespuesta(
                HttpStatus.CONFLICT,
                "La operación genera información duplicada o relacionada"
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RespuestaError> manejarValidaciones(
            MethodArgumentNotValidException excepcion
    ) {
        String mensaje = excepcion.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::formatearError)
                .collect(Collectors.joining(", "));

        return crearRespuesta(HttpStatus.BAD_REQUEST, mensaje);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<RespuestaError> manejarGeneral(
            Exception excepcion
    ) {
        excepcion.printStackTrace();

        return crearRespuesta(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Ocurrió un error interno en el servidor"
        );
    }

    private String formatearError(FieldError error) {
        return error.getField() + ": " + error.getDefaultMessage();
    }

    private ResponseEntity<RespuestaError> crearRespuesta(
            HttpStatus estado,
            String mensaje
    ) {
        return ResponseEntity.status(estado).body(
                new RespuestaError(
                        LocalDateTime.now(),
                        estado.value(),
                        estado.getReasonPhrase(),
                        mensaje
                )
        );
    }
}