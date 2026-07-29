package com.votaya.votaya_backend.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import com.votaya.votaya_backend.Excepciones.ReglaNegocioExcepcion;

@Service
public class ServicioWhatsApp {

    private final RestClient clienteTwilio;
    private final String accountSid;
    private final String authToken;
    private final String remitente;
    private final String contentSid;

    public ServicioWhatsApp(
            @Value("${twilio.account-sid}")
            String accountSid,

            @Value("${twilio.auth-token}")
            String authToken,

            @Value("${twilio.whatsapp-from}")
            String remitente,

            @Value("${twilio.content-sid}")
            String contentSid
    ) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.remitente = remitente;
        this.contentSid = contentSid;

        this.clienteTwilio = RestClient.builder()
                .baseUrl("https://api.twilio.com")
                .build();
    }

    public void enviarCodigoRecuperacion(
            String telefono,
            String codigo
    ) {
        String telefonoNormalizado =
                normalizarTelefono(telefono);

        String destino =
                "whatsapp:" + telefonoNormalizado;

        String credenciales =
                accountSid + ":" + authToken;

        String autenticacionBasica =
                Base64.getEncoder()
                        .encodeToString(
                                credenciales.getBytes(
                                        StandardCharsets.UTF_8
                                )
                        );

        /*
         * La plantilla configurada recibe una variable:
         *
         * {{1}} = código de recuperación.
         */
        String variables =
                "{\"1\":\"" + codigo + "\"}";

        MultiValueMap<String, String> formulario =
                new LinkedMultiValueMap<>();

        formulario.add("To", destino);
        formulario.add("From", remitente);
        formulario.add("ContentSid", contentSid);
        formulario.add(
                "ContentVariables",
                variables
        );

        try {
            clienteTwilio.post()
                    .uri(
                            "/2010-04-01/Accounts/{sid}/Messages.json",
                            accountSid
                    )
                    .header(
                            HttpHeaders.AUTHORIZATION,
                            "Basic " + autenticacionBasica
                    )
                    .contentType(
                            MediaType.APPLICATION_FORM_URLENCODED
                    )
                    .body(formulario)
                    .retrieve()
                    .toBodilessEntity();

        } catch (RestClientResponseException excepcion) {
            System.err.println(
                    "Error de Twilio: "
                            + excepcion.getResponseBodyAsString()
            );

            throw new ReglaNegocioExcepcion(
                    "No se pudo enviar el código por WhatsApp"
            );

        } catch (Exception excepcion) {
            excepcion.printStackTrace();

            throw new ReglaNegocioExcepcion(
                    "No fue posible conectar con el servicio de WhatsApp"
            );
        }
    }

    private String normalizarTelefono(
            String telefono
    ) {
        if (
                telefono == null
                || telefono.isBlank()
        ) {
            throw new ReglaNegocioExcepcion(
                    "La cuenta no tiene un teléfono registrado"
            );
        }

        String limpio = telefono
                .replace(" ", "")
                .replace("-", "")
                .replace("(", "")
                .replace(")", "")
                .trim();

        if (!limpio.matches(
                "^\\+[1-9][0-9]{9,14}$"
        )) {
            throw new ReglaNegocioExcepcion(
                    "El teléfono registrado no tiene un formato válido"
            );
        }

        return limpio;
    }
}