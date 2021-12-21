package it.units.travelshandler;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.impl.TextCodec;

import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.Provider;
import javax.xml.bind.DatatypeConverter;
import java.io.IOException;
import java.sql.*;
import java.time.Instant;
import java.util.Base64;
import java.util.List;

@Provider
public class JWTFilter implements ContainerRequestFilter {

    private static final String SECRET_KEY = "Yn2kjibddFAWtnPJ2AFlL8WXmohJMCvigQggaEypa5E=";

    @Override
    public void filter(ContainerRequestContext ctx) throws IOException {

        String debugResponse = "";
        if (ctx.getHeaders().get("Authorization") != null) {
            List auth = ctx.getHeaders().get("Authorization");
            String[] request = auth.get(0).toString().split(" ");
            debugResponse += "1\n";
            String jwt = "";
            switch (request[0]) {
                case ("Bearer"):
                    String idUtente = CheckJwt(request[1]);
                    if (idUtente == null) {
                        ctx.abortWith(Response.status(Response.Status.OK)
                                .entity("{\"message\":\"NotAccepted\"}")
                                .build());
                    } else {
                        ctx.setProperty("idUtente", idUtente);
                    }
                    break;
            }
        }
    }


    //https://developer.okta.com/blog/2018/10/31/jwts-with-java
    public static String CheckJwt(String jwt) {
        String debugResponse="";
        //This line will throw an exception if it is not a signed JWS (as expected)
        Claims claims = Jwts.parser()
                .setSigningKey(DatatypeConverter.parseBase64Binary(SECRET_KEY))
                .parseClaimsJws(jwt).getBody();

        debugResponse+=claims.getIssuer()+"\n";
        debugResponse+=claims.get("idUtente").toString()+"\n";
        if(!claims.getIssuer().equals("MatteoBille")) return null;
        if(claims.get("idUtente")==null) return null;

        String queryVerificaId = "SELECT NomeUtente FROM Utenti WHERE idUtente=\""+claims.get("idUtente")+"\";";
        Connection conn = sqliteConnection.connect();

        try (Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(queryVerificaId);
            debugResponse+=claims.getSubject().toString()+"\n";
            if (rs.next() != false) {
                debugResponse+=rs.getString("NomeUtente")+"\n";
                if(rs.getString("NomeUtente").equals(claims.getSubject())){
                    return claims.get("idUtente").toString();
                }

            }
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }
        try {
            conn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
}
