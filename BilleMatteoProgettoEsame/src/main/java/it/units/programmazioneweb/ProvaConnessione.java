package it.units.programmazioneweb;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class ProvaConnessione {
    public static void main(String... args){
        Connection conn =  sqliteConnection.connect();
        if(conn==null) {
            System.out.println("ERROREEEEEEEEEE");
        }
        try (Statement stmt = conn.createStatement()) {
            String query ="SELECT * FROM Viaggi;";
            ResultSet rs =stmt.executeQuery(query);

            while (rs.next()) {
                System.out.println(
                        rs.getInt("idUtente")+"\t"+
                        rs.getString("GeoJsonData") + "\t");

            }

        }catch (SQLException throwables) {
            throwables.printStackTrace();
        }finally {
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
