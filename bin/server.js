#!/usr/bin/env node
var base    = require('taskcluster-base');
var routes  = require('../routes');
var path    = require('path');
var debug   = require('debug')('taskcluster-stats:bin:server');
var Promise = require('promise');
var express = require('express');
var fs      = require('fs');
var url     = require('url');

/** Launch server */
var launch = function(profile) {
  // Load configuration
  var cfg = base.config({
    defaults:     require('../config/defaults'),
    profile:      require('../config/' + profile),
    envs: [
      'server_publicUrl',
      'server_cookieSecret',
      'influx_taskclusterdev',
      'influx_buildbot',
      'influx_grafana',
      'influx_stats-mshal-garbage',
      'influx_testing',
      'aws_accessKeyId',
      'aws_secretAccessKey'
    ],
    filename:     'taskcluster-stats'
  });

  // Create app
  var app = base.app({
    port:           Number(process.env.PORT || cfg.get('server:port')),
    env:            cfg.get('server:env'),
    forceSSL:       cfg.get('server:forceSSL'),
    trustProxy:     cfg.get('server:trustProxy')
  });

  // Setup middleware and authentication
  var ensureAuth = app.setup({
    cookieSecret:   cfg.get('server:cookieSecret'),
    viewFolder:     path.join(__dirname, '..', 'views'),
    assetFolder:    path.join(__dirname, '..', 'assets'),
    development:    cfg.get('server:development') === 'true',
    publicUrl:      cfg.get('server:publicUrl')
  });


  // Route configuration
  app.get('/',                                       routes.index);
  app.get('/unauthorized',                           routes.unauthorized);



  // Load configuration file
  var configFile = fs.readFileSync(
    path.join(__dirname, '..', 'grafana', 'config.js'),
    {encoding: 'utf8'}
  );


  var patchConfig = function(name) {
    var parts = url.parse(cfg.get('influx:' + name));
    configFile = configFile.replace(
      '{{influx:' + name + ':username}}',
      parts.auth.split(':')[0]
    ).replace(
      '{{influx:' + name + ':password}}',
      parts.auth.split(':')[1]
    );
    parts.auth = null;
    configFile = configFile.replace(
      '{{influx:' + name + '}}',
      url.format(parts)
    );
  };


  patchConfig('grafana');
  patchConfig('taskclusterdev');
  patchConfig('buildbot');
  patchConfig('stats-mshal-garbage');
  patchConfig('testing');


  app.get('/grafana/config.js', ensureAuth, function(req, res) {
    // Serve configuration file
    res.set('Content-Type', 'application/javascript')
       .status(200)
       .send(configFile);
  });
  app.use(
    '/grafana/',
    ensureAuth,
    express.static(path.join(__dirname, '..', 'grafana'))
  );

  // Create server
  return app.createServer();
};

// If server.js is executed start the server
if (!module.parent) {
  // Find configuration profile
  var profile = process.argv[2];
  if (!profile) {
    console.log("Usage: server.js [profile]")
    console.error("ERROR: No configuration profile is provided");
  }
  // Launch with given profile
  launch(profile).then(function() {
    debug("Launched stats server successfully");
  }).catch(function(err) {
    debug("Failed to start server, err: %s, as JSON: %j", err, err, err.stack);
    // If we didn't launch the server we should crash
    process.exit(1);
  });
}

// Export launch in-case anybody cares
module.exports = launch;