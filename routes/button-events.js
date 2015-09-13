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

router.post('/:buttonIndex', function(req, res, next) {
  req.checkParams('buttonIndex', 'Invalid buttonIndex').notEmpty().isInt();

  var errors = req.validationErrors();
  if (errors) {
    res.send('There have been validation errors: ' + util.inspect(errors), 400);
    return;
  }

  console.log ("button posted");

  res.send("success");
});

module.exports = router;
