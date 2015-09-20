var express = require('express');
var router = express.Router();

var util = require('util');

var Rhythm = require('../model/rhythm');

router.get('/', function(req, res, next) {
  var rhythmService = req.app.get('rhythmService');
  rhythmService.allItems(function(error, rhythms) {
    console.log ("Got results");
    if (error) {
      res.status(400);
      res.send("query error" + util.inspect(errors));
      return;
    }
    if (!rhythms.length) {
      res.status(400);
      res.send("No rhythm found");
      return;
    }
    var coolDownCalculator = req.app.get('coolDownCalculator');
    coolDownCalculator.addValuesForRhythms(rhythms, function (error, cooledRhythms) {
      if (error) {
        res.send (error);
        return;
      }
      cooledRhythms.forEach(function (rhythm) {
        delete rhythm.rowKey;
      });
      res.json(cooledRhythms);
    });
  });
});

router.post('/reset', function(req, res, next) {
  var rhythmService = req.app.get('rhythmService');
  rhythmService.allItems(function(error, results) {
    if (!error) {
      console.log("deleting items");
      results.forEach(function (item) {
        rhythmService.deleteItem (item, function(error, results) {
          if (error) {
            console.log("error deleting:");
            console.log(item);
          }
        });
      })

      var rhythm1 = new Rhythm();
      rhythm1.name = "Meditation";
      rhythm1.buttonIndex = 0;
      rhythmService.addItem (rhythm1, function (maybeError) {
        if (maybeError) {
          console.log (maybeError);
        }
      });
      var rhythm2 = new Rhythm();
      rhythm2.name = "Time Outside";
      rhythm2.buttonIndex = 1;
      rhythmService.addItem (rhythm2, function (maybeError) {
        if (maybeError) {
          console.log (maybeError);
        }
      });
      var rhythm3 = new Rhythm();
      rhythm3.name = "Exercise";
      rhythm3.buttonIndex = 2;
      rhythmService.addItem (rhythm3, function (maybeError) {
        if (maybeError) {
          console.log (maybeError);
        }
      });
      var rhythm4 = new Rhythm();
      rhythm4.name = "Unknown";
      rhythm4.buttonIndex = 3;
      rhythmService.addItem (rhythm4, function (maybeError) {
        if (maybeError) {
          console.log (maybeError);
        }
      });
      var rhythm5 = new Rhythm();
      rhythm5.name = "MP";
      rhythm5.buttonIndex = 4;
      rhythmService.addItem (rhythm5, function (maybeError) {
        if (maybeError) {
          console.log (maybeError);
        }
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

  var rhythmService = req.app.get('rhythmService');
  rhythmService.rhythmsWithButtonIndex(req.params.buttonIndex, function(error, rhythms) {
    if (error) {
      res.status(400);
      res.send("query error" + util.inspect(errors));
      return;
    }
    if (!rhythms.length) {
      res.status(400);
      res.send("No rhythm found");
      return;
    }
    var coolDownCalculator = req.app.get('coolDownCalculator');
    coolDownCalculator.addValuesForRhythms(rhythms, callback);
    var rhythm = rhythms[0];
    res.json(rhythms[0]);
  });
});

module.exports = router;
