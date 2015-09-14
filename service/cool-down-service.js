module.exports = CoolDownService;

function CoolDownService(buttonEventService) {
  this.buttonEventService = buttonEventService;
};

CoolDownService.prototype = {
  addValuesForRhythms: function(rhythms, callback) {
    var self = this;
    rhythms.forEach(function(part, index){
      self.buttonEventService.recentEventsWithButtonIndex(rhythms[index].buttonIndex, function (error, events) {
        if (error) {
          callback(error);
          return;
        }
        rhythms[index].coolDown = 0; // For Now

        // Rolling average
        var totalTime = 0;
        var previousDate = null;
        events.forEach(function(buttonEvent){
          if (previousDate === null) {
            previousDate = buttonEvent.eventTime;
          } else {
            totalTime += previousDate - buttonEvent.eventTime;
          }
        });
        var avgTime = (totalTime / events.length) * 2; // Scaled for grace ;)
        var timeSinceLastEvent = (new Date ()) - events[0].eventTime;
        var varianceFromAverage = timeSinceLastEvent - avgTime;
        console.log({ 'avgTime': avgTime, 'timeSinceLastEvent':timeSinceLastEvent, 'varianceFromAverage': varianceFromAverage, 'button': rhythms[index].buttonIndex});
        if (timeSinceLastEvent < avgTime) {
          rhythms[index].gaugeValue = 100;
        } else if (varianceFromAverage > avgTime) {
          rhythms[index].gaugeValue = 0;
        } else {
          // In the "sweet spot"
          rhythms[index].gaugeValue = Math.floor((varianceFromAverage/avgTime)*100);
        }
        if (index === rhythms.length - 1) {
          callback(null, rhythms);
        }
      });
    });
  },
}
