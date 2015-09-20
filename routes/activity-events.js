var express = require('express');
var router = express.Router();

var util = require('util');

router.post('/', function(req, res, next) {
  req.sanitizeBody('activityName');
  req.checkBody('wasEnjoyable', 'Invalid wasEnjoyable').optional().isBoolean();
  req.checkBody('enjoyableRating', 'Invalid enjoyableRating').isInt();
  req.checkBody('didAccomplish', 'Invalid didAccomplish').optional().isBoolean();
  req.checkBody('accomplishRating', 'Invalid accomplishRating').isInt();
  if (!req.body.hasOwnProperty('wasEnjoyable')) {
    req.body.wasEnjoyable = false;
  }
  if (!req.body.hasOwnProperty('didAccomplish')) {
    req.body.didAccomplish = false;
  }
  console.log(req.body);
  var errors = req.validationErrors();
  if (errors) {
    res.send('There have been validation errors: ' + util.inspect(errors), 400);
    return;
  }

  var journaler = req.app.get('journaler');
  journaler.addActivityEntry(req.body, function (error) {
    if (error) {
      res.send("error:" + util.inspect(error));
    }
    res.send("done");
  });
});

module.exports = router;
