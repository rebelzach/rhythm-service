module.exports = Rhythm;

function Rhythm(rhythmProperties) {
  this.rowKey = null;
  this.name = '';
  this.buttonIndex = 0;
  this.gaugeValue = 0;
  if (rhythmProperties) {
    for(var propertyName in rhythmProperties) {
      this[propertyName] = rhythmProperties[propertyName];
    }
  }
};
