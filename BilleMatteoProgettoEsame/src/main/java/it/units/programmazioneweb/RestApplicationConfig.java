package it.units.programmazioneweb;

import org.glassfish.jersey.server.ResourceConfig;

public class RestApplicationConfig extends ResourceConfig {

    public RestApplicationConfig() {
        packages( "it.units.programmazioneweb" );
        register( JWTFilter.class );
    }
}