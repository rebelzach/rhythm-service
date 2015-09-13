module.exports = ButtonEvent;

function ButtonEvent(eventProperties) {
  this.rowKey = null;
  this.eventTypes = {
    singlePress : 0
  };
  this.eventType = this.eventTypes.singlePress;
  this.buttonIndex = 0;
  this.eventTime = new Date();
  if (eventProperties) {
    for(var propertyName in eventProperties) {
      this[propertyName] = eventProperties[propertyName];
    }
  }
};
