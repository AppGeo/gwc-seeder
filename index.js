'use strict';

var GWC = require('./modules/geowebcache');
var settings = require('config');
var defaults = require('lodash.defaults');
var Promise = require('bluebird');

var seedRequests = settings.seedRequests;
var gwc = new GWC(settings.gwc.url, settings.gwc.username, settings.gwc.password);
var timeout;
var nextSeedRequestIndex = 0;


// Initialize
// ----------

log('Loop set to run every ' + settings.interval + ' seconds');
loop();
setInterval(loop, settings.interval * 1000);


// Functions
// ---------

function loop() {
  log('Running loop');
  log('Fetching statuses');
  
  gwc.getSeedStatus().then(function (statuses) {
    log('Found '+ statuses.length + ' running tasks');
    
    if (statuses.length) {
      log(JSON.stringify(statuses));
    }
    
    if (!statuses.length && nextSeedRequestIndex >= seedRequests.length) {
      
      log('Seeding processes finished and no more left to queue');
      log('Exiting program');
      process.exit();
      
    } else if (statuses.length >= settings.maxConcurrentTasks) {
      
      log('At or above maxConcurrentTasks limit of ' + settings.maxConcurrentTasks);
      log('Exiting loop');
      
    } else {
      
      var numTasksToRun = settings.maxConcurrentTasks - statuses.length;
      var queuedSeedRequests = [];
      var tasksToRun = [];
      
      // Queue seed requests.
      log('Queueing ' + numTasksToRun + ' seed requests');
      for (var i = 0; i < numTasksToRun; i++) {
        var seedRequestOptions = seedRequests[nextSeedRequestIndex];
        var seedRequest = createSeedRequest(seedRequestOptions);
        
        queuedSeedRequests.push(seedRequest);
        
        nextSeedRequestIndex++;
      }
      
      // Queue async tasks.
      log('Queueing seed requests as async tasks');
      tasksToRun = queuedSeedRequests.map(function (seedRequest) {
        var name = seedRequest.seedRequest.name;
        return gwc.seedLayer(seedRequest).then(function () {
          log('New task started successfully (' + name + ')');
        }).catch(function () {
          log('New task failed to start (' + name + ')');
        });
      });
      
      Promise.all(tasksToRun).then(function () {
        log('Exiting loop');
      }).catch(log);
      
    }
    
  }).catch(log);
}

function createSeedRequest(options) {
  return {
    'seedRequest': defaults({}, options, settings.seedRequestDefaults)
  };
}

function log(message) {
  var timestamp = new Date().toUTCString();
  console.log(timestamp, message);
}
