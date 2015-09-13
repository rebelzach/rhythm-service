var azure = require('azure-storage');
var uuid = require('node-uuid');
var entityGen = azure.TableUtilities.entityGenerator;
var Rhythm = require('../model/rhythm');
var ButtonEvent = require('../model/button-event');

module.exports = ButtonEventService;

function ButtonEventService(storageClient, tableName, partitionKey) {
  this.storageClient = storageClient;
  this.tableName = tableName;
  this.partitionKey = partitionKey;
  this.storageClient.createTableIfNotExists(tableName, function tableCreated(error) {
    if(error) {
      throw error;
    }
  });
};

ButtonEventService.prototype = {
  allItems: function(callback) {
    var self = this;
    var query = new azure.TableQuery().top(50);
    self.storageClient.queryEntities(this.tableName, query, null, function entitiesQueried(error, result) {
      if(error) {
        callback(error);
      } else {
        var eventModels = [];
        result.entries.forEach(function (entity) {
          eventModels.push(self.entityToEvent(entity));
        });
        callback(null, eventModels);
      }
    });
  },

  recentEventsWithButtonIndex: function (buttonIndex, callback) {
    var self = this;
    var query = new azure.TableQuery().top(10).where(azure.TableQuery.int32Filter('buttonIndex', azure.TableUtilities.QueryComparisons.EQUAL, buttonIndex));
    self.storageClient.queryEntities(self.tableName, query, null, function entitiesQueried(error, result) {
      if(error) {
        callback(error);
      } else {
        console.log(result);
        var eventModels = [];
        result.entries.forEach(function (entity) {
          rhythmModels.push(self.entityToEvent(entity));
        });
        callback(null, eventModels);
      }
    });
  },

  eventToEntity: function(buttonEvent) {
    var self = this;
    var entity = {
      PartitionKey: entityGen.String(self.partitionKey),
      RowKey: entityGen.String(buttonEvent.rowKey)
    };

    entity.buttonIndex = entityGen.Int32(buttonEvent.buttonIndex);
    entity.eventType = entityGen.Int32(buttonEvent.eventType);
    entity.eventTime = entityGen.DateTime(buttonEvent.eventTime);
    return entity;
  },

  entityToEvent: function(entity) {
    var eventProperties = {
      rowKey: entity.RowKey._,
    };
    if(entity.hasOwnProperty('buttonIndex')) {
      eventProperties.buttonIndex = parseInt(entity.buttonIndex._);
    }
    if(entity.hasOwnProperty('eventType')) {
      eventProperties.eventType = parseInt(entity.eventType._);
    }
    if(entity.hasOwnProperty('eventTime')) {
      eventProperties.eventTime = entity.eventTime._;
    }

    var buttonEvent = new ButtonEvent (eventProperties);
    return buttonEvent;
  },

  addItem: function(item, callback) {
    var self = this;
    item.rowKey = uuid();
    var itemDescriptor = self.eventToEntity(item);
    self.storageClient.insertEntity(self.tableName, itemDescriptor, function entityInserted(error) {
      if(error){
        callback(error);
      }
      callback(null);
    });
  },

  deleteItem: function(item, callback) {
    var self = this;
    var itemDescriptor = this.eventToEntity(item);
    self.storageClient.deleteEntity (this.tableName, itemDescriptor, null, function entitiesQueried(error, result) {
      if(error) {
        callback(error);
      } else {
        callback(null);
      }
    });
  },
}
