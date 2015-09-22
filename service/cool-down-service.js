var Promise = require('promise');

module.exports = CoolDownService;

function CoolDownService(buttonEventService) {
  this.buttonEventService = buttonEventService;
};

CoolDownService.prototype = {
  addValuesForRhythms: function(rhythms, callback) {
    var self = this;
    Promise.all(rhythms.map(_getEvents.bind(self))).done(function() {
      callback(null, rhythms);
    })
  },
}

function _getEvents(part, index, rhythms)
{
  //var getEvents = Promise.denodeify(self.buttonEventService.recentEventsWithButtonIndex);
  var self = this;
  return new Promise(function (fulfill, reject) {
    self.buttonEventService.recentEventsWithButtonIndex(rhythms[index].buttonIndex, function (error, events) {
      if (error) {
        reject(error);
        return;
      }

      if (events.length < 3) {
        rhythms[index].coolDown = 0;
        rhythms[index].gaugeValue = -1;
        fulfill();
        return;
      }

      // Rolling average
      var totalDuration = 0;
      var previousDate = null;
      var durations = new Array ();

      events.forEach(function(buttonEvent){
        if (previousDate === null) {
          previousDate = buttonEvent.eventTime;
        } else {
          var duration =  previousDate - buttonEvent.eventTime;
          durations.push(duration);
          totalDuration += duration;
        }
      });
      var timeSinceLastEvent = (new Date ()) - events[0].eventTime;
      var durationCount = events.length - 1;

      // If the time since the last event is more than twice the average, factor it into
      // the derivatives
      if (timeSinceLastEvent > (totalDuration / durationCount) * 2) {
        durations.unshift(timeSinceLastEvent - events[0]);
        ++durationCount;
      }
      var avgDuration = totalDuration / durationCount;

      var totalDerivative = 0;
      var previousDuration = null;
      var derivatives = new Array ();
      durations.forEach(function(duration){
        if (previousDuration === null) {
          previousDuration = duration;
        } else {
          var derivative = duration - previousDuration;
          derivatives.push(derivative);
          totalDerivative += derivative;
        }
      });
      console.log(derivatives);

      var avgDerivative = (totalDerivative / (durations.length - 1));
      var gaugeRatio = -(avgDerivative / avgDuration); // invert to make good things positives
      var uncappedGaugeValue = gaugeRatio * 1000;

      var gaugeValue = Math.round(Math.min (100, Math.max(0, uncappedGaugeValue)));
      var uncappedCoolDown = timeSinceLastEvent/avgDuration;
      var coolDown = Math.round(Math.min (100, Math.max(0, uncappedCoolDown)));
      console.log({ 'uncappedGaugeValue':uncappedGaugeValue, 'avgDuration': avgDuration, 'avgDerivative': avgDerivative, 'gaugeValue': gaugeValue, 'coolDown':coolDown, 'timeSinceLastEvent':timeSinceLastEvent, 'button': rhythms[index].buttonIndex});
      rhythms[index].coolDown = coolDown;
      rhythms[index].gaugeValue = gaugeValue;
      fulfill();
    });
  });
}
