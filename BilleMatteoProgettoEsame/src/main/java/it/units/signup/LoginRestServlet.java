package it.units.signup;

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

@Path("/login")
public class LoginRestServlet {

    private final String SECRET_KEY = "Yn2kjibddFAWtnPJ2AFlL8WXmohJMCvigQggaEypa5E=";

    @Context ServletContext context;


    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response loginUser(@Context ContainerRequestContext ctx) throws SQLException {

        String urlConnection = context.getInitParameter("DatabaseUrl");
        Connection conn = sqliteConnection.connect(urlConnection);

        String jwt = "";
        JSONObject response =new JSONObject();
        if (ctx.getHeaders().get("Authorization") != null) {
            List auth = ctx.getHeaders().get("Authorization");
            String[] request = auth.get(0).toString().split(" ");

            if (request[0].equals(("Basic"))) {
                byte[] decodedBytes = Base64.getDecoder().decode(request[1]);
                String decodedString = new String(decodedBytes);
                String[] authStrings = decodedString.split("\\.");

                if (authStrings.length == 2) {

                    String query2 = "SELECT * FROM Utenti WHERE NomeUtente = \"" + authStrings[0] + "\";";
                    try (Statement stmt = conn.createStatement()) {

                        ResultSet rs = stmt.executeQuery(query2);
                        if (rs.next() != false) {

                            String password = rs.getString("Password");
                            int id = rs.getInt("idUtente");
                            if (password.equals(authStrings[1])) {
                                jwt = SetToken(authStrings[0], id);
                                response.put("jwtToken", jwt);
                                response.put("message","Accepted");
                                return Response.ok(response.toString()).build();
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

                }
            }
        }
        response.put("message","NotAccepted");
        return Response.ok(response.toString()).build();

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
