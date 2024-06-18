# ESP32KinSki

 This is a master thesis project containing ESP-IDF microcontroller code for ESP32 (gatt_server_service_table), code for mobile device (flutter_application_demo TODO), code for the backend and kafka infrastructure (spring-boot-kafka-docker) and code for the frontend display of data (kinskifrontend)

## 1. ESP32 code (gatt_server_service_table)
 gatt_server_service_table is a ESP-IDF project. Best way to run build the project and flash it on the ESP32 is through ESP-IDF extension in Microsoft VSCode.

 The ESP32 acts as a bluetooth server on which the mobile phone connects and subscribes to a specific characteristic. The characteristic that the mobile phone subscribes (notify protocol) is on address 0xFF01 on service with address 0x00FF.

 The value that the mobile phone has to read is an array [x,y] being:
 - x the sign value of the direction of the tilt
 - y hexadecimal representation of tilt 0 being not tilted and 100(0x64) being tilted for 90 deg

Sampeling rate can also be modefied to the liking. (currently is 500ms)

## 2. Cloud code (spring-boot-kafka-docker and kinskifrontend)
### spring-boot-kafka-docker (backend and kafka)
This is a Spring Boot project containing a configuration for connecting to a kafka docker container. It contains a HTTP POST endpoint http://localhost:8080/publish on which it recieves data from the mobile phone.

Body of the post request should look something like this:
```
{
    "timestamp": "2024-04-23T18:40:50",
    "measurements": {
        "left_ski": [30, 35, 36, 50, 80, 50, 20, 30, 33, 37, 34, 55, 82, 48, 22, 29, 32, 38, 35, 53, 81, 47, 21, 28, 31, 39, 36, 51, 79, 49, 23, 27, 34, 37, 33, 54, 83, 46, 24, 26, 29, 36, 38, 52, 77, 45, 25, 31, 28, 35,52, 77, 45, 25, 31, 28, 35],
        "right_ski": [32, 38, 30, 30, 78, 50, 21, 32, 34, 39, 31, 29, 79, 52, 23, 30, 33, 37, 32, 28, 80, 49, 22, 31, 35, 38, 34, 27, 81, 51, 24, 29, 36, 39, 33, 26, 82, 48, 25, 30, 37, 38, 35, 25, 83, 50, 26, 28, 34, 32,25, 83, 50, 26, 28, 34, 32]
    },
    "measurement_delay": 500
}
```
- **timestamp** - represents the time and date when the first sample was taken, in this case 30 for the left ski and 32 for the right one
- **measurements** - represent measurements taken from both sensors 
- **measurement_delay** - represents the delay between taken measurements

After the sending of the POST request, body of the request is produced with the Kafka producer and the data is written on the topic in Kafka called measurements.

When the data is added to the topic it is consumed by the Kafka consumer, and sent to the frontend app using a websocket on the endpoint http://localhost:8080/ws-message, topic /**topic/message** (SockJS).

### kinskifrontend (frontend)
This is a React project containing the display of data provided by the backend. The app lisens to the changes provided on the endpoint http://localhost:8080/ws-message topic /**topic/message** (SockJS) and updates the graph accordingly.


> Best way to run the whole cloud is to use Docker Desktop and run ***docker compose up*** on the ***docker-compose.yml*** file in the spring-boot-kafka-docker project. After that docker will download the images and run the containers (backend,kafka,frontend). When running ***docker compose up*** the first time, the backend container should fail. But don't worry just run it again and it should work. If the frontend does not work just reset it as well. After that you can use the cloud normally.

## 3. Mobile code (zavrsni_mob)

Flutter app for connecting mobile phone with sensors and the cloud.

Currently works only on Android.
Install Flutter SDK and run **flutter build apk**.