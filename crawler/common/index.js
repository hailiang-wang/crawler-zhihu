/**
 * exports the common utils
 */

var _argv = require('optimist')
    .usage('Usage: $0 --host=localhost --port=3999 --logLevel=[INFO|DEBUG|ERROR] -dbUrl=mongodb://localhost:27017/crawler]')
    .default('host', 'localhost')
    .default('port', '3999')
    .default('logLevel', 'DEBUG')
    .default('dbUrl', 'mongodb://localhost:27017/crawler')
    .argv;

exports.argv = _argv;
exports.loggerUtil = require('./loggerUtil');