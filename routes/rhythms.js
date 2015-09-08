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

var RhythmService = require('../service/rhythm-service');
var rhythmService = new RhythmService(storageClient, rhythmTableName, partitionKey);

var Rhythm = require('../model/rhythm');

router.get('/', function(req, res, next) {
  console.log("Success");
  rhythmService.allItems(function(error, results) {
    console.log ("Got results");
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(results));
  });
});

router.get('/reset', function(req, res, next) {
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

module.exports = router;
