var azure = require('azure-storage');
var uuid = require('node-uuid');
var entityGen = azure.TableUtilities.entityGenerator;
var Rhythm = require('../model/rhythm');

module.exports = RhythmService;

function RhythmService(storageClient, tableName, partitionKey) {
  this.storageClient = storageClient;
  this.tableName = tableName;
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
        rhythmModels.sort(function (a, b) {
          return a.buttonIndex - b.buttonIndex;
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
    entity.buttonIndex = entityGen.Int32(parseInt(rhythm.buttonIndex));
    return entity;
  },

  entityToRhythm: function(entity) {
    var rhythmProperties = {
      rowKey: entity.RowKey._,
    };

    rhythmProperties.name = entity.name._;
    rhythmProperties.buttonIndex = parseInt(entity.buttonIndex._);

    var rhythm = new Rhythm (rhythmProperties);
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
