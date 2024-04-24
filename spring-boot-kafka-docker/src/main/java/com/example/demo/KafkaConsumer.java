package com.example.demo;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumer {

    @KafkaListener(topics = "measurements", groupId = "kinski")
    public void consume(String message){
        System.out.println(message);
    }
}
