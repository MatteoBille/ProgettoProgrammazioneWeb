package it.units.travelshandler;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.ws.rs.*;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.core.*;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
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
        if(auth != null && auth.split(" ")[0].equals("Bearer")){
            idUser = checkJwt(auth.split(" ")[1]);
            if(idUser == null){
                return Response.ok("{\"message\":\"NotAccepted\"").build();
            }
        }else{
            return Response.ok("{\"message\":\"NotAccepted\"").build();
        }

        String urlConnection = context.getInitParameter("DatabaseUrl");
        Connection conn = sqliteConnection.connect(urlConnection);


        JSONArray geoJsonResponse = new JSONArray();
        JSONObject response= new JSONObject();




        String selectUserTravelsByDate = "SELECT * FROM Viaggi WHERE dataViaggio = \""+data+"\" AND idUtente= "+idUser+";";

        String selectMaxIdViaggio = "SELECT MAX(idViaggio) as idViaggio FROM Viaggi;";

        try (Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(selectUserTravelsByDate);
            while (rs.next()) {
                JSONObject jsonObject = new JSONObject(rs.getString("GeoJsonData"));
                jsonObject.put("id",Integer.toString(rs.getInt("idViaggio")));
                geoJsonResponse.put(jsonObject);
            }

        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }

        response.put("geoJson",geoJsonResponse);


        try (Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(selectMaxIdViaggio);
            while (rs.next()) {
                response.put("id",rs.getInt("idViaggio"));
            }

        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }
        conn.close();

        return Response.ok(response.toString().replaceAll("\\\\","")).build();
    }
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public Response addTravel(@QueryParam("data") String data,@HeaderParam("Authorization") String auth,String requestBody) throws SQLException {

        String idUser="";
        if(auth != null && auth.split(" ")[0].equals("Bearer")){
            idUser = checkJwt(auth.split(" ")[1]);
            if(idUser == null){
                return Response.ok("{\"message\":\"NotAccepted\"").build();
            }
        }else{
            return Response.ok("{\"message\":\"NotAccepted\"").build();
        }

        String urlConnection = context.getInitParameter("DatabaseUrl");
        Connection conn = sqliteConnection.connect(urlConnection);



        JSONObject jsonRequest=new JSONObject(requestBody);
        String id = jsonRequest.getString("id");
        JSONObject jsonResponse=new JSONObject();
        String insertIntoViaggiNewTravel = "INSERT INTO Viaggi VALUES("+id+","+idUser+",'"+requestBody+"','"+data+"');";

        try (Statement stmt = conn.createStatement()) {
            stmt.executeUpdate(insertIntoViaggiNewTravel);
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }

        String querySelect = "SELECT idViaggio,GeoJsonData FROM Viaggi WHERE idViaggio="+id+";";
        try (Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery(querySelect);
            jsonResponse= new JSONObject(rs.getString("GeoJsonData"));
            jsonResponse.put("id",Integer.toString(rs.getInt("idViaggio")));

        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }

        conn.close();
        return Response.ok(jsonResponse.toString()).build();
    }

    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteTravel(String requestBody,@HeaderParam("Authorization") String auth) throws SQLException {
        String idUser="";
        if(auth != null && auth.split(" ")[0].equals("Bearer")) {
            idUser = checkJwt(auth.split(" ")[1]);
            if(idUser == null){
                return Response.ok("{\"message\":\"NotAccepted\"").build();
            }
        }else{
            return Response.ok("{\"message\":\"NotAccepted\"").build();
        }


        String urlConnection = context.getInitParameter("DatabaseUrl");
        Connection conn = sqliteConnection.connect(urlConnection);


        JSONObject jsonRequest=new JSONObject(requestBody);
        String idViaggio = jsonRequest.getString("id");

        JSONObject jsonResponse=new JSONObject();

        String deleteFromViaggiByIdViaggio = "DELETE FROM Viaggi WHERE idViaggio="+idViaggio+";";

        try (Statement stmt = conn.createStatement()) {
            stmt.executeUpdate(deleteFromViaggiByIdViaggio);
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }

        jsonResponse.put("deleted","ok");

        conn.close();

        return Response.ok(jsonResponse.toString()).build();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTravelById(@PathParam("id") int idViaggio,@HeaderParam("Authorization") String auth) throws SQLException {
        String idUser="";
        if(auth != null && auth.split(" ")[0].equals("Bearer")) {
            idUser = checkJwt(auth.split(" ")[1]);
            if(idUser == null){
                return Response.ok("{\"message\":\"NotAccepted\"").build();
            }
        }else{
            return Response.ok("{\"message\":\"NotAccepted\"").build();
        }


        String urlConnection = context.getInitParameter("DatabaseUrl");
        Connection conn = sqliteConnection.connect(urlConnection);

        JSONObject jsonObject=null;


        String selectViaggiByIdViaggio = "SELECT IdViaggio,GeoJsonData FROM Viaggi WHERE idViaggio="+idViaggio+";";

        try (Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery(selectViaggiByIdViaggio);
            jsonObject= new JSONObject(rs.getString("GeoJsonData"));
            jsonObject.put("id",Integer.toString(rs.getInt("idViaggio")));


        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }
        conn.close();
        return Response.ok(jsonObject.toString()).build();
    }

    @PUT
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateTravelById(@PathParam("id") int idViaggio,String geoJson,@HeaderParam("Authorization") String auth) throws SQLException {
        String idUser="";
        if(auth != null && auth.split(" ")[0].equals("Bearer")) {
            idUser = checkJwt(auth.split(" ")[1]);
            if(idUser == null){
                return Response.ok("{\"message\":\"NotAccepted\"").build();
            }
        }else{
            return Response.ok("{\"message\":\"NotAccepted\"").build();
        }

        String urlConnection = context.getInitParameter("DatabaseUrl");
        Connection conn = sqliteConnection.connect(urlConnection);

        JSONObject jsonResponse=null;
        String updateViaggio = "UPDATE Viaggi SET GeoJsonData ='"+geoJson+"' WHERE idViaggio="+idViaggio+";";
        String selectViaggioByidViaggio = "SELECT IdViaggio,GeoJsonData FROM Viaggi WHERE IdViaggio="+idViaggio+";";

        try (Statement stmt = conn.createStatement()) {
            stmt.executeUpdate(updateViaggio);
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }

        try (Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery(selectViaggioByidViaggio);
            jsonResponse= new JSONObject(rs.getString("GeoJsonData"));
            jsonResponse.put("id",Integer.toString(rs.getInt("idViaggio")));


        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }
        conn.close();
        return Response.ok(jsonResponse.toString()).build();
    }


    public String checkJwt(String jwt) {
        String urlConnection = context.getInitParameter("DatabaseUrl");

        Connection conn = sqliteConnection.connect(urlConnection);

        //This line will throw an exception if it is not a signed JWS (as expected)
        Claims claims = Jwts.parser()
                .setSigningKey(DatatypeConverter.parseBase64Binary(SECRET_KEY))
                .parseClaimsJws(jwt).getBody();

        if(!claims.getIssuer().equals("MatteoBille")) return null;
        if(claims.get("idUtente")==null) return null;

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

}
