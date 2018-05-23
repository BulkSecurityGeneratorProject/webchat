1) sudo ./mvnw package -Pprod dockerfile:build -DskipTests -e
2) sudo docker-compose -f src/main/docker/app.yml up
