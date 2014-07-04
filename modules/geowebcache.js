'use strict';

var Promise = require('bluebird');
var request = require('request');
Promise.promisifyAll(request);

var baseUrl;
var requestSettings;
var statusDefinitions = {
  '-1': 'ABORTED',
  '0' : 'PENDING',
  '1' : 'RUNNING',
  '2' : 'DONE'
};

function GeoWebCache(url, username, password) {
  baseUrl = url;
  
  requestSettings = {
    json: true,
    auth: {
      user: username,
      pass: password
    }
  };
}

GeoWebCache.prototype.getSeedStatus = function () {
  return request.getAsync(baseUrl + '/seed.json', requestSettings).get(1).then(function (data) {
    var result = data['long-array-array'].map(function (statusArray) {
      return {
        processed: statusArray[0],
        total: statusArray[1],
        remaining: statusArray[2],
        id: statusArray[3],
        status: statusDefinitions[statusArray[4]]
      };
    });
    
    return Promise.resolve(result);
  });
};

GeoWebCache.prototype.seedLayer = function (seedRequest) {
  var layerName = seedRequest.seedRequest.name;
  return request.postAsync(baseUrl + '/seed/' + layerName + '.json', {
    json: seedRequest,
    auth: requestSettings.auth
  }).get(1);
};

module.exports = GeoWebCache;