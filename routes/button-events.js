var express = require('express');
var router = express.Router();

var util = require('util');

var ButtonQueryHandler = require('../service/button-event-query-handler')

var ButtonEvent = require('../model/button-event');

router.post('/', function(req, res, next) {
  ButtonQueryHandler.postEvent(req, function (error) {
    if (error) {
      res.status(400);
      res.send('There have been validation errors: ' + util.inspect(error));
    } else {
      res.send("success");
    }
  });
});

router.get('/', function(req, res, next) {
  var eventService = req.app.get('eventService');
  eventService.allItems(function (error, events) {
    res.render('events', { title: 'Events', events: events });
  });
});

router.post('/reset', function(req, res, next) {
  var eventService = req.app.get('eventService');
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
  var eventService = req.app.get('eventService');
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
