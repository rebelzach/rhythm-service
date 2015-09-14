var express = require('express');
var router = express.Router();
var azure = require('azure-storage');
var nconf = require('nconf');
nconf.env()
     .file({ file: 'config.json', search: true });
var rhythmTableName = nconf.get("RHYTHM_TABLE_NAME");
var partitionKey = nconf.get("PARTITION_KEY");
var accountName = nconf.get("STORAGE_NAME");
var accountKey = nconf.get("STORAGE_KEY");
var storageClient = azure.createTableService(accountName, accountKey);
var util = require('util');

var RhythmService = require('../service/rhythm-service');
var rhythmService = new RhythmService(storageClient, rhythmTableName, partitionKey);

var Rhythm = require('../model/rhythm');

router.get('/', function(req, res, next) {
  console.log("Success");
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
    rhythms.forEach(function (rhythm) {
      delete rhythm.rowKey;
    });
    res.json(rhythms);
  });
});

router.post('/reset', function(req, res, next) {
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
      rhythm1.gaugeValue = 20;
      rhythmService.addItem (rhythm1, function (maybeError) {
        if (maybeError) {
          console.log (maybeError);
        }
      });
      var rhythm2 = new Rhythm();
      rhythm2.name = "Time Outside";
      rhythm2.buttonIndex = 1;
      rhythm2.gaugeValue = 40;
      rhythmService.addItem (rhythm2, function (maybeError) {
        if (maybeError) {
          console.log (maybeError);
        }
      });
      var rhythm3 = new Rhythm();
      rhythm3.name = "Exercise";
      rhythm3.buttonIndex = 2;
      rhythm3.gaugeValue = 60;
      rhythmService.addItem (rhythm3, function (maybeError) {
        if (maybeError) {
          console.log (maybeError);
        }
      });
      var rhythm4 = new Rhythm();
      rhythm4.name = "Unknown";
      rhythm4.buttonIndex = 3;
      rhythm4.gaugeValue = 80;
      rhythmService.addItem (rhythm4, function (maybeError) {
        if (maybeError) {
          console.log (maybeError);
        }
      });
      var rhythm5 = new Rhythm();
      rhythm5.name = "MP";
      rhythm5.buttonIndex = 4;
      rhythm5.gaugeValue = 100;
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
  //req.params.buttonIndex
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
    var rhythm = rhythms[0];
    res.json(rhythms[0]);
  });
});

module.exports = router;
