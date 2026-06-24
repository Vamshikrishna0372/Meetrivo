package com.meetrivo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MeetrivoBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MeetrivoBackendApplication.class, args);
    }

}
