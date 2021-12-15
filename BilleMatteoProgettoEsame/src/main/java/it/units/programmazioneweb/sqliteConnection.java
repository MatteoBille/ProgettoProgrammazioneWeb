package it.units.programmazioneweb;

import org.jetbrains.annotations.NotNull;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class sqliteConnection {


    public static Connection connect() {
        Connection c=null;
            try {
                Class.forName("org.sqlite.JDBC");
                String dbURL = "jdbc:sqlite:C:\\Users\\Billo\\Desktop\\DbProgrammazioneWeb.db";
                c = DriverManager.getConnection(dbURL);


            } catch (ClassNotFoundException ex) {
                ex.printStackTrace();
            } catch (SQLException ex) {
                ex.printStackTrace();
            }
        return c;
    }
}
