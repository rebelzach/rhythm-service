curl -H "Content-Type: application/json" --data "{ \"buttonIndex\": 0, \"eventType\": 0 }" http://localhost:3000/button-events

curl --data "" http://localhost:3000/button-events/reset

curl http://localhost:3000/button-events/
