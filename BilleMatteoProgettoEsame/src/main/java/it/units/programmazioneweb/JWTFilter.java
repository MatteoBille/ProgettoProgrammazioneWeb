package it.units.programmazioneweb;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.impl.TextCodec;
import org.json.JSONObject;

import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.Provider;
import javax.xml.bind.DatatypeConverter;
import java.io.IOException;
import java.sql.*;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.Base64;
import java.util.Calendar;
import java.util.List;

@Provider
public class JWTFilter implements ContainerRequestFilter {

    private static final String SECRET_KEY = "Yn2kjibddFAWtnPJ2AFlL8WXmohJMCvigQggaEypa5E=";

    @Override
    public void filter(ContainerRequestContext ctx) throws IOException {

        String debugResponse = "";
        if (ctx.getHeaders().get("Authorization")!=null) {
            List auth = ctx.getHeaders().get("Authorization");
            String[] request = auth.get(0).toString().split(" ");
            debugResponse+="1\n";
            String jwt = "";
            switch (request[0]) {
                case ("Bearer"):
                    String idUtente=CheckJwt(request[1]);
                    if(idUtente==null){
                        ctx.abortWith(Response.status(Response.Status.OK)
                                //.entity("{\"message\":\"NotAccepted\"}")
                                .entity(idUtente)
                                .build());
                    }else{
                        ctx.setProperty("idUtente",idUtente);
                    }
                    break;
                case ("Basic"):
                    Connection conn = sqliteConnection.connect();
                    debugResponse+="2\n";
                    byte[] decodedBytes = Base64.getDecoder().decode(request[1]);
                    String decodedString = new String(decodedBytes);
                    String[] AuthStrings = decodedString.split("\\.");

                    String query2 = "SELECT * FROM Utenti WHERE NomeUtente = \"" + AuthStrings[0] + "\";";
                    debugResponse += query2 + "\n";
                    try (Statement stmt = conn.createStatement()) {

                        ResultSet rs = stmt.executeQuery(query2);
                        if (rs.next() != false) {

                            String password = rs.getString("Password");
                            debugResponse+=password+"\n";
                            debugResponse+=AuthStrings[1]+"\n";
                            int id = rs.getInt("idUtente");
                            if (password.equals(AuthStrings[1])) {
                                jwt = SetToken(AuthStrings[0], id);
                                debugResponse+="token:"+jwt+"\n";
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

                    ctx.abortWith(Response.status(Response.Status.OK)
                            .entity("{\"jwtToken\":\""+jwt+"\"}")
                            .build());
                    break;
            }
        }else {
            debugResponse += "3\n";
            ctx.abortWith(Response.status(Response.Status.OK)
                    .entity("{\"message\":\"NotAccepted\"}")
                    .build());
        }
    }

    //Trovata su internet
    public String SetToken(String name, int id) {
        long nowTime = Instant.now().getEpochSecond();
        long ExpirationTime = nowTime + 900;
        String jws = Jwts.builder()
                .setIssuer("MatteoBille")
                .setSubject(name)
                .claim("idUtente", id)
                .claim("scope", "user")
                .setIssuedAt(Date.from(Instant.ofEpochSecond(nowTime)))
                .setExpiration(Date.from(Instant.ofEpochSecond(ExpirationTime)))
                .signWith(
                        SignatureAlgorithm.HS256,
                        TextCodec.BASE64.decode(SECRET_KEY)
                )
                .compact();
        return jws;
    }
    //https://developer.okta.com/blog/2018/10/31/jwts-with-java
    public static String CheckJwt(String jwt) {
        //This line will throw an exception if it is not a signed JWS (as expected)
        Claims claims = Jwts.parser()
                .setSigningKey(DatatypeConverter.parseBase64Binary(SECRET_KEY))
                .parseClaimsJws(jwt).getBody();


        if(!claims.getIssuer().equals("MatteoBille")) return null;
        if(claims.get("idUtente")==null) return null;

        String queryVerificaId = "SELECT NomeUtente FROM Utenti WHERE idUtente=\""+claims.get("idUtente")+"\";";
        Connection conn = sqliteConnection.connect();

        try (Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(queryVerificaId);
            if (rs.next() != false) {
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
