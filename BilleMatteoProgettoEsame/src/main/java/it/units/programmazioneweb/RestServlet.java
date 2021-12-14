package it.units.programmazioneweb;

import com.google.gson.Gson;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

@Path("/viaggi")
public class RestServlet {
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response firstResponse() {
        Connection conn = sqliteConnection.connect();
        //StringBuilder response = new StringBuilder();
        JSONArray response = new JSONArray();


        try (Statement stmt = conn.createStatement()) {
            String query = "SELECT IdViaggio,GeoJsonData FROM Viaggi;";
            ResultSet rs = stmt.executeQuery(query);
            while (rs.next()) {
                JSONObject jsonObject = new JSONObject(rs.getString("GeoJsonData"));
                jsonObject.put("id",Integer.toString(rs.getInt("idViaggio")));
                response.put(jsonObject);
            }

        } catch (SQLException throwables) {
            throwables.printStackTrace();
        } finally {
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }

        return Response.ok(response.toString()).build();
    }
    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTravelById(@PathParam("id") int id) {
        Connection conn = sqliteConnection.connect();
        JSONObject jsonObject=null;
        try (Statement stmt = conn.createStatement()) {
            String query = "SELECT IdViaggio,GeoJsonData FROM Viaggi WHERE IdViaggio=="+id+";";
            ResultSet rs = stmt.executeQuery(query);
            jsonObject= new JSONObject(rs.getString("GeoJsonData"));
            jsonObject.put("id",Integer.toString(rs.getInt("idViaggio")));


        } catch (SQLException throwables) {
            throwables.printStackTrace();
        } finally {
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        return Response.ok(jsonObject.toString()).build();


    }

}
