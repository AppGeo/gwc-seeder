'use strict';

module.exports = {

  gwc: {
    url: 'http://server/geoserver/gwc/rest',
    username: 'username',
    password: 'password'
  },
  
  interval: 300, // seconds, 300sec = 5min
  
  seedRequestDefaults: {
    'srs': {
      'number': 900913
    },
    'zoomStart': 7,
    'zoomStop': 14,
    'format': 'image\/png',
    'type': 'reseed',
    'threadCount': 1
  },
  
  maxConcurrentTasks: 1
  
};
