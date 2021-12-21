package it.units.travelshandler;

import org.glassfish.jersey.server.ResourceConfig;

public class RestApplicationConfig extends ResourceConfig {

    public RestApplicationConfig() {
        packages( "it.units.travelshandler" );
        register( JWTFilter.class );
    }
}