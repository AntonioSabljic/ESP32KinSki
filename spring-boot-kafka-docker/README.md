# Spring Boot Kafka Docker

Spring Boot and Spring Kafka application .

# Run
1. Start kafka and backend:
```
docker-compose up
```

2. Build [application.properties](src/main/resources/application.properties) file to set your Kafka IP exposed through Docker:
```
spring.kafka.bootstrap-servers=localhost:9092 is for local running
spring.kafka.bootstrap-servers=kafka:9092 is for running with docker container
```

3. Start Spring Boot application:
```
./mvnw spring-boot:run
```

# Publish a message
To publish a message, access the endpoint `http://localhost:8080/publish`.

Send a POST request to the mentioned endpoint with the body of the POST request
looking like this:

```
{
    "timestamp": "2024-04-23T18:40:50",
    "measurements": {
        "left_ski": [30, 35, 36, 50, 80, 50, 20, 30, 33, 37, 34, 55, 82, 48, 22, 29, 32, 38, 35, 53, 81, 47, 21, 28, 31, 39, 36, 51, 79, 49, 23, 27, 34, 37, 33, 54, 83, 46, 24, 26, 29, 36, 38, 52, 77, 45, 25, 31, 28, 35],
        "right_ski": [32, 38, 30, 30, 78, 50, 21, 32, 34, 39, 31, 29, 79, 52, 23, 30, 33, 37, 32, 28, 80, 49, 22, 31, 35, 38, 34, 27, 81, 51, 24, 29, 36, 39, 33, 26, 82, 48, 25, 30, 37, 38, 35, 25, 83, 50, 26, 28, 34, 32]
    },
    "measurement_delay": 1000
}
```