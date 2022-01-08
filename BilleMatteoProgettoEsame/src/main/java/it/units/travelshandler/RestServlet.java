package it.units.travelshandler;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.impl.TextCodec;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.ws.rs.*;
import javax.ws.rs.core.*;
import java.sql.*;
import java.time.Duration;
import java.time.Instant;
import javax.servlet.ServletContext;
import javax.xml.bind.DatatypeConverter;

@Path("/viaggi")
public class RestServlet {

    private static final String SECRET_KEY = "Yn2kjibddFAWtnPJ2AFlL8WXmohJMCvigQggaEypa5E=";
    @Context ServletContext context;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTravels( @QueryParam("data") String data,@HeaderParam("Authorization") String auth) throws SQLException {
        String idUser="";
        if(auth != null && auth.split(" ")[0].equals("Bearer")) {
            try {
                idUser = checkJwt(auth.split(" ")[1]);
            } catch (Exception e) {
                return Response.status(Response.Status.NOT_ACCEPTABLE).entity("{\"error\":\"invalid_token\"}").build();
            }
        }else{
            return Response.status(Response.Status.NOT_ACCEPTABLE).entity("{\"error\":\"Authentication token not present\"}").build();
        }

        String urlConnection = context.getInitParameter("DatabaseUrl");
        Connection conn = sqliteConnection.connect(urlConnection);


        JSONArray geoJsonResponseArray = new JSONArray();




        String selectUserTravelsByDate = "SELECT * FROM Viaggi WHERE dataViaggio = \""+data+"\" AND idUtente= "+idUser+";";

        String selectMaxIdViaggio = "SELECT MAX(idViaggio) as idViaggio FROM Viaggi;";

        try (Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(selectUserTravelsByDate);
            while (rs.next()) {
                JSONObject jsonObject = new JSONObject(rs.getString("GeoJsonData"));
                jsonObject.put("id",Integer.toString(rs.getInt("idViaggio")));
                geoJsonResponseArray.put(jsonObject);
            }

        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }

        JSONObject response = new JSONObject();
        try (Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(selectMaxIdViaggio);
            while (rs.next()) {
                response.put("id",rs.getInt("idViaggio"));
            }

        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }
        conn.close();
        String newToken= SetToken(auth.split(" ")[1],Integer.parseInt(idUser));


        response.put("geoJsons",geoJsonResponseArray);
        response.put("jwtToken",newToken);
        return Response.ok(response.toString().replaceAll("\\\\","")).build();
    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public Response addTravel(@QueryParam("data") String data,@HeaderParam("Authorization") String auth,String requestBody) throws SQLException {

        String idUser="";
        if(auth != null && auth.split(" ")[0].equals("Bearer")) {
            try {
                idUser = checkJwt(auth.split(" ")[1]);
            } catch (Exception e) {
                return Response.status(Response.Status.NOT_ACCEPTABLE).entity("{\"error\":\"invalid_token\"}").build();
            }
        }else{
            return Response.status(Response.Status.NOT_ACCEPTABLE).entity("{\"error\":\"Authentication token not present\"}").build();
        }

        String urlConnection = context.getInitParameter("DatabaseUrl");
        Connection conn = sqliteConnection.connect(urlConnection);



        JSONObject jsonRequest=new JSONObject(requestBody);
        String id = jsonRequest.getString("id");
        JSONObject geoJsonResponse=new JSONObject();
        String insertIntoViaggiNewTravel = "INSERT INTO Viaggi VALUES("+id+","+idUser+",'"+requestBody+"','"+data+"');";

        try (Statement stmt = conn.createStatement()) {
            stmt.executeUpdate(insertIntoViaggiNewTravel);
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }

        String querySelect = "SELECT idViaggio,GeoJsonData FROM Viaggi WHERE idViaggio="+id+";";
        try (Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery(querySelect);
            geoJsonResponse= new JSONObject(rs.getString("GeoJsonData"));
            geoJsonResponse.put("id",Integer.toString(rs.getInt("idViaggio")));

        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }

        conn.close();
        String newToken= SetToken(auth.split(" ")[1],Integer.parseInt(idUser));
        JSONObject response = new JSONObject();

        response.put("geoJson",geoJsonResponse);
        response.put("jwtToken",newToken);
        return Response.ok(response.toString()).build();
    }

    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteTravel(String requestBody,@HeaderParam("Authorization") String auth) throws SQLException {
        String idUser="";
        if(auth != null && auth.split(" ")[0].equals("Bearer")) {
            try {
                idUser = checkJwt(auth.split(" ")[1]);
            } catch (Exception e) {
                return Response.status(Response.Status.NOT_ACCEPTABLE).entity("{\"error\":\"invalid_token\"}").build();
            }
        }else{
            return Response.status(Response.Status.NOT_ACCEPTABLE).entity("{\"error\":\"Authentication token not present\"}").build();
        }

        String urlConnection = context.getInitParameter("DatabaseUrl");
        Connection conn = sqliteConnection.connect(urlConnection);


        JSONObject jsonRequest=new JSONObject(requestBody);
        String idViaggio = jsonRequest.getString("id");

        JSONObject geoJsonResponse=new JSONObject();

        String deleteFromViaggiByIdViaggio = "DELETE FROM Viaggi WHERE idViaggio="+idViaggio+";";

        try (Statement stmt = conn.createStatement()) {
            stmt.executeUpdate(deleteFromViaggiByIdViaggio);
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }



        conn.close();
        String newToken= SetToken(auth.split(" ")[1],Integer.parseInt(idUser));

        JSONObject response = new JSONObject();

        response.put("deleted","ok");
        response.put("jwtToken",newToken);
        return Response.ok(response.toString()).build();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTravelById(@PathParam("id") int idViaggio,@HeaderParam("Authorization") String auth) throws SQLException {
        String idUser="";
        if(auth != null && auth.split(" ")[0].equals("Bearer")) {
            try {
                idUser = checkJwt(auth.split(" ")[1]);
            } catch (Exception e) {
                return Response.status(Response.Status.NOT_ACCEPTABLE).entity("{\"error\":\"invalid_token\"}").build();
            }

        }else{
            return Response.status(Response.Status.NOT_ACCEPTABLE).entity("{\"error\":\"Authentication token not present\"}").build();
        }


        String urlConnection = context.getInitParameter("DatabaseUrl");
        Connection conn = sqliteConnection.connect(urlConnection);

        JSONObject geoJsonResponse=null;


        String selectViaggiByIdViaggio = "SELECT IdViaggio,GeoJsonData FROM Viaggi WHERE idViaggio="+idViaggio+";";

        try (Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery(selectViaggiByIdViaggio);
            geoJsonResponse= new JSONObject(rs.getString("GeoJsonData"));
            geoJsonResponse.put("id",Integer.toString(rs.getInt("idViaggio")));


        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }
        conn.close();
        String newToken= SetToken(auth.split(" ")[1],Integer.parseInt(idUser));

        JSONObject response = new JSONObject();

        response.put("geoJson",geoJsonResponse);
        response.put("jwtToken",newToken);

        return Response.ok(response.toString()).build();
    }

    @PUT
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateTravelById(@PathParam("id") int idViaggio,String geoJson,@HeaderParam("Authorization") String auth) throws SQLException {
        String idUser="";
        if(auth != null && auth.split(" ")[0].equals("Bearer")) {
            try {
                idUser = checkJwt(auth.split(" ")[1]);
            } catch (Exception e) {
                return Response.status(Response.Status.NOT_ACCEPTABLE).entity("{\"error\":\"invalid_token\"}").build();
            }
        }else{
            return Response.status(Response.Status.NOT_ACCEPTABLE).entity("{\"error\":\"Authentication token not present\"}").build();
        }

        String urlConnection = context.getInitParameter("DatabaseUrl");
        Connection conn = sqliteConnection.connect(urlConnection);

        JSONObject geoJsonResponse=null;
        String updateViaggio = "UPDATE Viaggi SET GeoJsonData ='"+geoJson+"' WHERE idViaggio="+idViaggio+";";
        String selectViaggioByidViaggio = "SELECT IdViaggio,GeoJsonData FROM Viaggi WHERE IdViaggio="+idViaggio+";";

        try (Statement stmt = conn.createStatement()) {
            stmt.executeUpdate(updateViaggio);
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }

        try (Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery(selectViaggioByidViaggio);
            geoJsonResponse= new JSONObject(rs.getString("GeoJsonData"));
            geoJsonResponse.put("id",Integer.toString(rs.getInt("idViaggio")));


        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }
        conn.close();
        String newToken= SetToken(auth.split(" ")[1],Integer.parseInt(idUser));

        JSONObject response = new JSONObject();

        response.put("geoJson",geoJsonResponse);
        response.put("jwtToken",newToken);
        return Response.ok(response.toString()).build();
    }


    public String checkJwt(String jwt) throws Exception{
        String urlConnection = context.getInitParameter("DatabaseUrl");

        Connection conn = sqliteConnection.connect(urlConnection);
        Claims claims=null;
        try {
        //This line will throw an exception if it is not a signed JWS (as expected)
         claims = Jwts.parser()
                .setSigningKey(DatatypeConverter.parseBase64Binary(SECRET_KEY))
                .parseClaimsJws(jwt).getBody();
        } catch (Exception e) {
           throw e;
        }

        String queryVerificaId = "SELECT NomeUtente FROM Utenti WHERE idUtente=\""+claims.get("idUtente")+"\";";


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



    public String SetToken(String jwtOld, int id) {


        Claims claims = Jwts.parser()
                .setSigningKey(DatatypeConverter.parseBase64Binary(SECRET_KEY))
                .parseClaimsJws(jwtOld).getBody();




        Duration remainingTime = Duration.between(claims.getExpiration().toInstant(),Instant.now());
        if(remainingTime.getSeconds()<300){
            return jwtOld;
        }

        long nowTime = Instant.now().getEpochSecond();
        long ExpirationTime = nowTime + 900;
        String jwt = Jwts.builder()
                .setIssuer("MatteoBille")
                .setSubject(claims.getSubject())
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
