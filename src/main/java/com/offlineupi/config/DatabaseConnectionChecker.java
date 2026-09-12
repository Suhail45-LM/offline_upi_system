package com.offlineupi.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

@Component
public class DatabaseConnectionChecker implements CommandLineRunner {

    @Autowired
    private DataSource dataSource;

    @Override
    public void run(String... args) {
        try (Connection connection = dataSource.getConnection()) {
            System.out.println("\n=========================================================");
            System.out.println("✅ SUCCESS: Connected to PostgreSQL database!");
            System.out.println("Database URL: " + connection.getMetaData().getURL());
            System.out.println("=========================================================\n");
        } catch (Exception e) {
            System.out.println("\n❌ FAILURE: Could not connect to the database.");
            e.printStackTrace();
        }
    }
}