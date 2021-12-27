package it.units.travelshandler;

import org.json.JSONArray;
import org.json.JSONObject;

import javax.ws.rs.*;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.core.*;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

@Path("/viaggi")
public class RestServlet {


    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTravels( @QueryParam("data") String data,@Context ContainerRequestContext crc) throws SQLException {

        String debugString="";
        Connection conn = sqliteConnection.connect();

        JSONArray geoJsonResponse = new JSONArray();
        JSONObject response= new JSONObject();



        String idUser = crc.getProperty("idUtente").toString();

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
    public Response addTravel(@QueryParam("data") String data,@Context ContainerRequestContext crc,String requestBody) throws SQLException {
        Connection conn = sqliteConnection.connect();

        String idUser = crc.getProperty("idUtente").toString();

        JSONObject jsonRequest=new JSONObject(requestBody);
        String id = jsonRequest.getString("id");
        JSONObject jsonResponse=new JSONObject();
        String insertIntoViaggiNewTravel = "INSERT INTO Viaggi VALUES("+id+","+idUser+",'"+requestBody+"','"+data+"');";

        try (Statement stmt = conn.createStatement()) {
            stmt.executeUpdate(insertIntoViaggiNewTravel);
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }
        conn.close();
        conn = sqliteConnection.connect();
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
    public Response deleteTravel(String requestBody) throws SQLException {
        Connection conn = sqliteConnection.connect();

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
    public Response getTravelById(@PathParam("id") int idViaggio) throws SQLException {
        Connection conn = sqliteConnection.connect();
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
    public Response updateTravelById(@PathParam("id") int idViaggio,String geoJson) throws SQLException {
        Connection conn = sqliteConnection.connect();
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
}
