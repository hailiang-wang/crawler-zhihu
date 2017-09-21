/**
 * File Store Management
 */
var appInit = require('../appinit.js');
var Database = require('./database');
var mongoose = require('mongoose');
var common = require('../common');
var Grid = require('gridfs-stream');
var logger = common.loggerUtil.getLogger('fileStore');
var connection = null,
    gfs = null;

appInit.add();

function _init() {
    Grid.mongo = mongoose.mongo;
    gfs = Grid(connection.db);
    module.exports = exports = gfs;
    logger.info('_init', 'service is started.');
    appInit.resolve();
    logger.info('appInit', 'resolved.')
}

Database.initPromise.onFulfill(function() {
    try {
        connection = Database.connection;
        _init();
    } catch (err) {
        logger.error(err);
    }
});
