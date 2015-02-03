module.exports = {
  // Influx database connection strings, to be provided in config.js
  influx: {
    grafana:                        undefined,
    taskclusterdev:                 undefined,
    buildbot:                       undefined,
    'stats-mshal-garbage':          undefined,
    testing:                        undefined,
    raptor:                         undefined
  },

  // Server configuration
  server: {
    // Public URL from which the server can be accessed (used for persona)
    publicUrl:                      'https://stats.taskcluster.net',

    // Port to listen for requests on
    port:                           undefined,

    // Environment 'development' or 'production'
    env:                            'development',

    // Force SSL, not useful when runnning locally
    forceSSL:                       false,

    // Trust a forwarding proxy
    trustProxy:                     false,

    // Secret used to signed cookies
    cookieSecret:                   'Warn, if no secret is used on production'
  },

  // AWS SDK configuration for publication of schemas and references
  aws: {
    // Access key id (typically configured using environment variables)
    accessKeyId:                    undefined,

    // Secret access key (typically configured using environment variables)
    secretAccessKey:                undefined,

    // Default AWS region, this is where the S3 bucket lives
    region:                         'us-west-2',

    // Lock API version to use the latest API from 2013, this is fuzzy locking,
    // but it does the trick...
    apiVersion:                     '2014-01-01'
  }
};
