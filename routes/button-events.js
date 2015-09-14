var express = require('express');
var router = express.Router();
var azure = require('azure-storage');
var nconf = require('nconf');
nconf.env()
     .file({ file: 'config.json', search: true });
var buttonEventTableName = nconf.get("BUTTON_EVENT_TABLE_NAME");
var partitionKey = nconf.get("PARTITION_KEY");
var accountName = nconf.get("STORAGE_NAME");
var accountKey = nconf.get("STORAGE_KEY");
var storageClient = azure.createTableService(accountName, accountKey);
var util = require('util');

var ButtonEvent = require('../model/button-event');

var EventService = require('../service/button-event-service');
var eventService = new EventService(storageClient, buttonEventTableName, partitionKey);

router.post('/', function(req, res, next) {
  console.log (req.body);
  var buttonLimits = { min: 0, max: 5 };
  req.checkBody('buttonIndex').isInt(buttonLimits);
  req.checkBody('eventType').isInt();

  var errors = req.validationErrors();
  if (errors) {
    res.status(400);
    res.send('There have been validation errors: ' + util.inspect(errors));
    return;
  }

  var newEvent = new ButtonEvent ();
  newEvent.buttonIndex = req.body.buttonIndex;
  newEvent.eventType = req.body.eventType;

  eventService.addItem(newEvent, function (error) {
    console.log ("button posted");
    res.send("success");
  });
});

router.get('/', function(req, res, next) {
  eventService.allItems(function (error, events) {
    res.json(events);
  });
});

router.post('/reset', function(req, res, next) {
  eventService.allItems(function(error, results) {
    if (!error) {
      console.log("deleting items");
      results.forEach(function (item) {
        eventService.deleteItem (item, function(error, results) {
          if (error) {
            console.log("error deleting:");
            console.log(item);
          }
        });
      });

      res.send("Success");
    }
  });
});

router.get('/:buttonIndex', function(req, res, next) {
  req.checkParams('buttonIndex', 'Invalid buttonIndex').notEmpty().isInt();

  var errors = req.validationErrors();
  if (errors) {
    res.send('There have been validation errors: ' + util.inspect(errors), 400);
    return;
  }

  eventService.recentEventsWithButtonIndex(req.params.buttonIndex, function(error, events) {
    if (error) {
      res.status(400);
      res.send("query error" + util.inspect(errors));
      return;
    }
    res.json(events);
  });
});

module.exports = router;
