package it.units.programmazioneweb;

import com.google.gson.Gson;
import org.json.JSONArray;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
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
        StringBuilder response = new StringBuilder();
        try (Statement stmt = conn.createStatement()) {
            String query = "SELECT GeoJsonData FROM Viaggi;";
            ResultSet rs = stmt.executeQuery(query);
            response.append("[");
            while (rs.next()) {
                response.append(rs.getString("GeoJsonData"));
                response.append(",");
            }
            response.deleteCharAt(response.length()-1);
            response.append("]");
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
}
