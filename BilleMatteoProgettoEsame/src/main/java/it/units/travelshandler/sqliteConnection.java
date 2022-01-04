package it.units.travelshandler;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class sqliteConnection {


    public static Connection connect(String urlDatabase) {
        Connection c=null;
            try {
                Class.forName("org.sqlite.JDBC");
                String dbURL = "jdbc:sqlite:"+urlDatabase;
                c = DriverManager.getConnection(dbURL);


            } catch (ClassNotFoundException ex) {
                ex.printStackTrace();
            } catch (SQLException ex) {
                ex.printStackTrace();
            }
        return c;
    }
}
