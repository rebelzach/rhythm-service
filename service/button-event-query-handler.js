var ButtonEvent = require('../model/button-event');
var util = require('util');

module.exports = {
  postEvent: function(req, callback) {
    console.log (req.body);
    var buttonLimits = { min: 0, max: 4 };
    req.checkBody('buttonIndex').isInt(buttonLimits);
    req.checkBody('eventType').isInt();

    var errors = req.validationErrors();
    if (errors) {
      callback(errors);
      return;
    }

    var newEvent = new ButtonEvent ();
    newEvent.buttonIndex = req.body.buttonIndex;
    newEvent.eventType = req.body.eventType;
    var eventService = req.app.get('eventService');
    eventService.addItem(newEvent, function (error) {
      if (error) {
        callback(error);
        return;
      }
      console.log ("button event added");

      var rhythmService = req.app.get('rhythmService');
      rhythmService.rhythmsWithButtonIndex(newEvent.buttonIndex, function (error, rhythms) {
        var journaler = req.app.get('journaler');
        journaler.addEventEntry(rhythms[0].name, function (error) {
          callback(error);
        });
      });
    });
  }
}
