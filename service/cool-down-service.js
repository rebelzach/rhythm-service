module.exports = CoolDownService;

function CoolDownService(buttonEventService) {
  this.buttonEventService = buttonEventService;
};

CoolDownService.prototype = {
  calculateCoolDownForRhythm: function(rhythm) {
    return 50;
  },
  calculateGaugeForRhythm: function(rhythm) {
    return 50;
  }
}
