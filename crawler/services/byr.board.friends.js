/**
 * Fetch byr friends data into database
 */
var crawler = require('./crawler'),
    common = require('../common'),
    logger = common.loggerUtil.getLogger('byr.board.friends'),
    Q = require('q'),
    minimatch = require('minimatch'),
    url = require('url'),
    _ = require('lodash'),
    database = require('../persistence/database'),
    Friends = require('../persistence/model').Friends,
    BYR_HOST = 'http://bbs.byr.cn',
    util = require('util'),
    CronJob = require('cron').CronJob,
    schedule = '1 * * * *',
    slave = null;

var blackListPaths = ['/article/Friends/post', '/article/Friends/tmpl'];


function _resolveTopicBody(path) {
    var deferred = Q.defer();

    crawler.queue({
            uri: util.format('%s%s', BYR_HOST, path),
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        // resolve author
        .then(function(response) {
            var result = response.result,
                $ = response.$;

            $'.b-content .a-wrap.corner').each(function(index, b) {
                if (index == 0) {
                    $AuthorEl = $(b).find('div.a-wrap.corner .article .a-u-name');
                    response.authorName = $AuthorEl.text();
                    response.authorLink = $AuthorEl.html();
                } else {
                    // commentor
                    // don't save comment now.
                }
            });
            return response;
        })
        // resolve avatar
        .then(function(response) {
            var result = response.result,
                $ = response.$;

            $('.b-content .a-wrap.corner').each(function(index, b) {
                if (index == 0) {
                    $AuthorAvatar = $(b).find('div.a-wrap.corner .article .a-u-img');
                    response.authorAvatar = $AuthorAvatar.html();
                } else {
                    // commentor
                    // don't save comment now.
                }
            });
            return response;
        })
        // resolve body
        .then(function(response) {
            var result = response.result,
                $ = response.$;

            $('.b-content .a-wrap.corner').each(function(index, b) {
                if (index == 0) {
                    $body = $(b).find('div.a-wrap.corner .article .a-content .a-content-wrap');
                    response.body = $body.html();
                } else {
                    // commentor
                    // don't save comment now.
                }
            });
            return response;
        })
        // validate response
        .then(function(response) {
            // reduce data size
            delete response.result
            delete response.$
            deferred.resolve(response);
        })
        .fail(function(err) {
            deferred.reject(err);
        });

    return deferred.promise;
}

function _saveTopicWithMetadata(doc) {
    _resolveTopicBody(doc.path)
        .then(function(response) {
            doc.author = {
                name: response.authorName,
                link: response.authorLink,
                avatar: response.authorAvatar
            };
            doc.content = {
                type: 'html',
                body: response.body
            };
            doc.save(function(err, d) {
                if (err) {
                    logger.error(err);
                } else {
                    logger.info('_saveTopicWithMetadata', "added " + JSON.stringify(d._id));
                }
            });
        })
        .fail(function(err) {
            // Fail to retrieve topic metadata like author name,link,
            // avatar and body.
            logger.error(err);
        });
}

function _onResponse(result, $) {
    var urls = {}
    $('a').each(function(index, a) {
        if (typeof $(a).attr('href') == 'string' &&
            (_.indexOf(blackListPaths, $(a).attr('href')) == -1)) {
            var href = $(a).attr('href');
            if (minimatch(href, '/article/Friends/*')) {
                var pathname = url.parse(href).pathname;
                if (!urls[pathname]) {
                    // console.log(pathname);
                    urls[pathname] = $(a).text();
                }
            }
        }
    });
    logger.debug('_onResponse', 'urls = ' + JSON.stringify(urls));
    var keys = _.keys(urls);
    keys.forEach(function(key) {
        // Use find + limit
        // https://blog.serverdensity.com/checking-if-a-document-exists-mongodb-slow-findone-vs-find/
        Friends.find({
                server: BYR_HOST,
                path: key
            })
            .limit(1)
            .exec()
            .then(function(doc) {
                if (doc.length == 0) {
                    var friend = new Friends();
                    friend.server = BYR_HOST;
                    friend.path = key;
                    friend.title = urls[key];
                    _saveTopicWithMetadata(friend);
                    // friend.save(function(err, doc) {
                    //     if (err) {
                    //         logger.error('_onResponse save', err);
                    //     } else {
                    //         logger.debug('_onResponse save', util.format('%s/%s is saved.', BYR_HOST, key));
                    //     }
                    // });
                } else {
                    logger.warn('save', util.format('%s%s does exist.', BYR_HOST, key));
                }
            }, function(err) {
                // Do not handle it now.
                logger.error('save', err);
            });
    });
}

function _start() {
    crawler.queue({
            uri: 'http://bbs.byr.cn/board/Friends',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(function(response) {
            if (response.result && response.$) {
                _onResponse(response.result, response.$);
            }
        })
        .fail(function(err) {
            logger.error(err);
        });
}

function _init() {
    logger.info('_init', 'service is started.');
    slave = new CronJob({
        cronTime: schedule,
        onTick: function() {
            var self = this;
            _start()
        },
        onComplete: null,
        start: true,
        timeZone: 'Asia/Shanghai',
        context: {}
    });
}

database.initPromise.onFulfill(function() {
    _init();
    // for quick test
    // _start();
});

exports.resolveTopicBody = _resolveTopicBody;
