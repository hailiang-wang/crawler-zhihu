/**
 * subsribe EMPEvent and process triggers
 */

var Database = require('../persistence/database');
var appInit = require('../appinit.js');
var minimatch = require("minimatch");
var common = require('../common');
var logger = common.loggerUtil.getLogger('eventq');
var config = common.argv;

var monq = require('monq');
var client = monq(config.dbUrl);

var que = client.queue('eventq');

appInit.add();

/**
 * handle arrival events
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
function _handleOnBehalf(event) {
    logger.debug('_handleOnBehalf', event);
    // check event pattern and publish out.
    if (minimatch(event.event, "collection:schedule:*")) {
        
        logger.debug('_handleOnBehalf', 'process collection:schedule ...');
        que.enqueue('schedule', event, function(err, job) {
            logger.debug('enqueue', job.data);
        });
    }
}


Database.initPromise.onFulfill(function() {
    try {
        // listening all patterns
        Database.empEvent.on('*', function(event) {
            // logger.debug('on', event);
            setImmediate(_handleOnBehalf, event);
        });

        // eventq is started
        logger.info('eventq service is started.');
        appInit.resolve();
    } catch (err) {
        logger.error(err);
        appInit.reject(err);
    }

});
