package it.units.loginsignup;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.impl.TextCodec;
import it.units.travelshandler.sqliteConnection;
import org.json.JSONObject;

import javax.servlet.ServletContext;
import javax.ws.rs.*;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.sql.*;
import java.time.Instant;
import java.util.Base64;
import java.util.List;

@Path("/SignUp")
public class SignUpRestServlet {

    private static final String SECRET_KEY = "Yn2kjibddFAWtnPJ2AFlL8WXmohJMCvigQggaEypa5E=";
    @Context ServletContext context;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response SetNewUser(@Context ContainerRequestContext ctx) throws SQLException {
        String urlConnection = context.getInitParameter("DatabaseUrl");
        Connection conn = sqliteConnection.connect(urlConnection);

        if (ctx.getHeaders().get("Authorization") != null) {
            List auth = ctx.getHeaders().get("Authorization");
            String[] request = auth.get(0).toString().split(" ");
            if (request[0].equals("Basic")) {
                byte[] decodedBytes = Base64.getDecoder().decode(request[1]);
                String decodedString = new String(decodedBytes);
                String[] AuthStrings = decodedString.split("\\.");


                String queryInserimentoNuovoUtente = "INSERT INTO Utenti(NomeUtente,Password) VALUES(\"" + AuthStrings[0] + "\",\"" + AuthStrings[1] + "\")";
                String retrieveLastId = "SELECT seq FROM sqlite_sequence WHERE name=\"Utenti\"";

                int idUtente = -1;
                try (Statement stmt = conn.createStatement()) {

                    stmt.executeUpdate(queryInserimentoNuovoUtente);

                    ResultSet rs = stmt.executeQuery(retrieveLastId);
                    if (rs.next() != false) {
                        idUtente = rs.getInt("seq");
                    }

                } catch (SQLException throwables) {
                    throwables.printStackTrace();
                }
                conn.close();
                String jwt = SetToken(AuthStrings[0], idUtente);
                JSONObject response = new JSONObject();
                response.put("jwtToken", jwt);

                return Response.ok(response.toString()).build();
            }
        }
        return Response.status(500).build();
    }

    public String SetToken(String name, int id) {

        long nowTime = Instant.now().getEpochSecond();
        long ExpirationTime = nowTime + 900;
        String jwt = Jwts.builder()
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
        return jwt;
    }
}
