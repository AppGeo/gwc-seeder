'use strict';

var GWC = require('./modules/geowebcache');
var debug = require('debug')('index');
var defaults = require('lodash.defaults');
var Promise = require('bluebird');

var settings = require('./config/settings');
var seedRequests = require('./config/seed-requests').requests;
var gwc = new GWC(settings.gwc.url, settings.gwc.username, settings.gwc.password);
var timeout;
var nextSeedRequestIndex = 0;


// Initialize
// ----------

debug('Loop set to run every ' + settings.interval + ' seconds');
loop();
setInterval(loop, settings.interval * 1000);


// Functions
// ---------

function loop() {
  debug('Running loop');
  debug('Fetching statuses');
  
  gwc.getSeedStatus().then(function (statuses) {
    debug('Found '+ statuses.length + ' running tasks');
    
    if (statuses.length) {
      debug(JSON.stringify(statuses));
    }
    
    if (!statuses.length && nextSeedRequestIndex >= seedRequests.length) {
      
      debug('Seeding processes finished and no more left to queue');
      debug('Exiting program');
      process.exit();
      
    } else if (statuses.length >= settings.maxConcurrentTasks) {
      
      debug('At or above maxConcurrentTasks limit of ' + settings.maxConcurrentTasks);
      debug('Exiting loop');
      
    } else {
      
      var numTasksToRun = settings.maxConcurrentTasks - statuses.length;
      var queuedSeedRequests = [];
      var tasksToRun = [];
      
      // Queue seed requests.
      debug('Queueing ' + numTasksToRun + ' seed requests');
      for (var i = 0; i < numTasksToRun; i++) {
        debugger;
        var seedRequestOptions = seedRequests[nextSeedRequestIndex];
        var seedRequest = createSeedRequest(seedRequestOptions);
        
        queuedSeedRequests.push(seedRequest);
        
        nextSeedRequestIndex++;
      }
      
      // Queue async tasks.
      debug('Queueing seed requests as async tasks');
      tasksToRun = queuedSeedRequests.map(function (seedRequest) {
        debugger;
        var name = seedRequest.seedRequest.name;
        return gwc.seedLayer(seedRequest).then(function () {
          debug('New task started successfully (' + name + ')');
        }).catch(function () {
          debug('New task failed to start (' + name + ')');
        });
      });
      
      Promise.all(tasksToRun).then(function () {
        debug('Exiting loop');
      }).catch(debug);
      
    }
    
  }).catch(debug);
}

function createSeedRequest(options) {
  return {
    'seedRequest': defaults({}, options, settings.seedRequestDefaults)
  };
}
