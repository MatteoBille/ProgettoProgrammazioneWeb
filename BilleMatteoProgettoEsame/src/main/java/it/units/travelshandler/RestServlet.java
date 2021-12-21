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



        String idUtente = crc.getProperty("idUtente").toString();

        String query1 = "SELECT * FROM Viaggi WHERE dataViaggio = \""+data+"\" AND idUtente= "+idUtente+";";
        try (Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(query1);
            while (rs.next()) {
                JSONObject jsonObject = new JSONObject(rs.getString("GeoJsonData"));
                jsonObject.put("id",Integer.toString(rs.getInt("idViaggio")));
                geoJsonResponse.put(jsonObject);
            }

        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }
        conn.close();
        response.put("geoJson",geoJsonResponse);
        conn = sqliteConnection.connect();

        String query2 = "SELECT MAX(idViaggio) as idViaggio FROM Viaggi;";
        try (Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(query2);
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
        String debugString="";
        String idUtente = crc.getProperty("idUtente").toString();

        debugString+=idUtente+"\n";
        debugString+=data+"\n";
        debugString+=requestBody+"\n\n\n\n\"";
        JSONObject jsonRequest=new JSONObject(requestBody);
        String id = jsonRequest.getString("id");
        JSONObject jsonResponse=new JSONObject();
        String queryInsert = "INSERT INTO Viaggi VALUES("+id+","+idUtente+",'"+requestBody+"','"+data+"');";
        debugString+=queryInsert+"\n";
        try (Statement stmt = conn.createStatement()) {
            stmt.executeUpdate(queryInsert);
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
        //debugString+="Fine"+"\n";
        return Response.ok(jsonResponse.toString()).build();
        //return Response.ok(debugString).build();
    }

    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteTravel(String requestBody) throws SQLException {
        Connection conn = sqliteConnection.connect();

        JSONObject jsonRequest=new JSONObject(requestBody);
        String id = jsonRequest.getString("id");

        JSONObject jsonResponse=new JSONObject();
        JSONArray jsonArrayResponse =new JSONArray();
        String queryInsert = "DELETE FROM Viaggi WHERE idViaggio="+id+";";
        try (Statement stmt = conn.createStatement()) {
            stmt.executeUpdate(queryInsert);
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }
        conn.close();
        conn = sqliteConnection.connect();
        String querySelect = "SELECT * FROM Viaggi;";

        try (Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery(querySelect);
            while (rs.next()) {
                jsonResponse= new JSONObject(rs.getString("GeoJsonData"));
                jsonResponse.put("id",Integer.toString(rs.getInt("idViaggio")));
                jsonArrayResponse.put(jsonResponse);
            }




        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }

        conn.close();

        return Response.ok(jsonArrayResponse.toString()).build();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTravelById(@PathParam("id") int id) throws SQLException {
        Connection conn = sqliteConnection.connect();
        JSONObject jsonObject=null;
        try (Statement stmt = conn.createStatement()) {
            String query = "SELECT IdViaggio,GeoJsonData FROM Viaggi WHERE idViaggio="+id+";";
            ResultSet rs = stmt.executeQuery(query);
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
    public Response updateTravelById(@PathParam("id") int id,String geoJson) throws SQLException {
        Connection conn = sqliteConnection.connect();
        JSONObject jsonResponse=null;
        try (Statement stmt = conn.createStatement()) {
            String query = "UPDATE Viaggi SET GeoJsonData ='"+geoJson+"' WHERE idViaggio="+id+";";
            stmt.executeUpdate(query);
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }

        conn.close();
        conn = sqliteConnection.connect();

        String querySelect = "SELECT IdViaggio,GeoJsonData FROM Viaggi WHERE IdViaggio=="+id+";";
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
/*
    @DELETE
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteStage(@PathParam("id") int id,String requestBody) throws SQLException {
    }

*/
}
