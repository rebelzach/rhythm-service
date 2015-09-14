var azure = require('azure-storage');
var uuid = require('node-uuid');
var entityGen = azure.TableUtilities.entityGenerator;
var Rhythm = require('../model/rhythm');
var nconf = require('nconf');
nconf.env()
     .file({ file: 'config.json', search: true });
var buttonEventTableName = nconf.get("BUTTON_EVENT_TABLE_NAME");

var EventService = require('../service/button-event-service');
var CoolDownCalculator = require('../service/cool-down-service');

module.exports = RhythmService;

function RhythmService(storageClient, tableName, partitionKey) {
  this.storageClient = storageClient;
  this.tableName = tableName;
  // Creating this service again here is not the right place but I don't know IOC on JS
  var eventService = new EventService(storageClient, buttonEventTableName, partitionKey);
  this.coolDownCalculator = new CoolDownCalculator(eventService);
  this.partitionKey = partitionKey;
  this.storageClient.createTableIfNotExists(tableName, function tableCreated(error) {
    if(error) {
      throw error;
    }
  });
};

RhythmService.prototype = {
  allItems: function(callback) {
    var self = this;
    var query = new azure.TableQuery().top(50);
    self.storageClient.queryEntities(this.tableName, query, null, function entitiesQueried(error, result) {
      if(error) {
        callback(error);
      } else {
        var rhythmModels = [];
        result.entries.forEach(function (entity) {
          rhythmModels.push(self.entityToRhythm(entity));
        });
        callback(null, rhythmModels);
      }
    });
  },

  rhythmsWithButtonIndex: function (buttonIndex, callback) {
    var self = this;
    var query = new azure.TableQuery().where(azure.TableQuery.int32Filter('buttonIndex', azure.TableUtilities.QueryComparisons.EQUAL, buttonIndex));
    self.storageClient.queryEntities(self.tableName, query, null, function entitiesQueried(error, result) {
      if(error) {
        callback(error);
      } else {
        console.log(result);
        var rhythmModels = [];
        result.entries.forEach(function (entity) {
          var rhythm = self.entityToRhythm(entity);
          rhythmModels.push(rhythm);
        });
        callback(null, rhythmModels);
      }
    });
  },

  rhythmToEntity: function(rhythm) {
    var self = this;
    var entity = {
      PartitionKey: entityGen.String(self.partitionKey),
      RowKey: entityGen.String(rhythm.rowKey)
    };

    entity.name = entityGen.String(rhythm.name);
    entity.buttonIndex = entityGen.Int32(rhythm.buttonIndex.toInt());
    return entity;
  },

  entityToRhythm: function(entity) {
    var rhythmProperties = {
      rowKey: entity.RowKey._,
    };

    rhythmProperties.name = entity.name._;
    rhythmProperties.buttonIndex = parseInt(entity.buttonIndex._);

    var rhythm = new Rhythm (rhythmProperties);
    rhythm.gaugeValue = this.coolDownCalculator.calculateGaugeForRhythm(rhythm);
    rhythm.coolDown = this.coolDownCalculator.calculateCoolDownForRhythm(rhythm);
    return rhythm;
  },

  deleteItem: function(item, callback) {
    var self = this;
    var itemDescriptor = this.rhythmToEntity(item);
    self.storageClient.deleteEntity (this.tableName, itemDescriptor, null, function entitiesQueried(error, result) {
      if(error) {
        callback(error);
      } else {
        callback(null);
      }
    });
  },

  addItem: function(item, callback) {
    var self = this;
    item.rowKey = uuid();
    var itemDescriptor = self.rhythmToEntity(item);
    self.storageClient.insertEntity(self.tableName, itemDescriptor, function entityInserted(error) {
      if(error){
        callback(error);
      }
      callback(null);
    });
  },
}
