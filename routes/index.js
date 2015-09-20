var express = require('express');
var router = express.Router();
var ButtonQueryHandler = require('../service/button-event-query-handler');

/* GET home page. */
router.get('/', function(req, res, next) {
  _renderIndex (req, res);
});

router.post('/', function(req, res, next) {
  var buttonIndex = parseInt(req.body.buttonIndex);
  var eventType = parseInt(req.body.eventType);
  ButtonQueryHandler.postEvent(req, function (error) {
    if (error) {
      res.status(400);
      res.send('There have been validation errors: ' + util.inspect(error));
    } else {
      _renderIndex(req, res);
    }
  });
});

function _renderIndex (req, res) {
  var rhythmService = req.app.get('rhythmService');
  rhythmService.allItems(function(error, rhythms) {
    var coolDownCalculator = req.app.get('coolDownCalculator');
    coolDownCalculator.addValuesForRhythms(rhythms, function (error, cooledRhythms) {
      if (error) {
        res.send (error);
        return;
      }
      cooledRhythms.forEach(function (rhythm) {
        delete rhythm.rowKey;
      });
      res.render('index', { title: 'Rhythms', rhythms: cooledRhythms });
    });
  });
}

module.exports = router;
