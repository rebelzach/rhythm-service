curl http://rhythmuser:Letsdoitfortherightreasons@localhost:3000/

curl -H "Content-Type: application/js{ \"buttonIndex\": 0, \"eventType\": 0 }" http://rhythmuser:Letsdoitfortherightreasons@localhost:3000/button-events

curl --data "" http://rhythmuser:Letsdoitfortherightreasons@localhost:3000/button-events/reset

curl http://rhythmuser:Letsdoitfortherightreasons@localhost:3000/button-events/
