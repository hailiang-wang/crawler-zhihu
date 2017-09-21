var Crawler = require('crawler');
var Q = require('q');
var _ = require('lodash');
// var minimatch = require('minimatch');
// var url = require('url');

// function _processLink(index, a, $) {
//     if (typeof $(a).attr('href') == 'string') {
//         var href = $(a).attr('href');
//         if (minimatch(href, '/article/Friends/*')) {
//             var pathname = url.parse(href).pathname;
//             if (!urls[pathname]) {
//                 // console.log(pathname);
//                 urls[pathname] = $(a).text();
//             }
//         }
//     }
// }

var _c = new Crawler({
    maxConnections: 1000,
    rotateUA: true,
    userAgent: ["Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405",
		"Mozilla/5.0 (Windows; U; Windows NT 5.2) Gecko/2008070208 Firefox/3.0.1",
		"Opera/8.0 (Macintosh; PPC Mac OS X; U; en)",
		"Mozilla/5.0 (Windows; U; Windows NT 5.2) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.2.149.27 Safari/525.13 ",
		"Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1) ;  QIHU 360EE)"],
    forceUTF8: true
    // This will be called for each crawled page
    // callback: function(error, result, $) {
    //         // $ is Cheerio by default
    //         //a lean implementation of core jQuery designed specifically for the server
    //         // $('img').each(function(index, a) {
    //         //     var toQueueUrl = $(a).attr('src');
    //         //     console.log("get ..." + toQueueUrl);
    //         //     // c.queue(toQueueUrl);
    //         // });
    //         $('a').each(function(index, a) {
    //             _processLink(index, a, $);
    //         });
    //         console.log(JSON.stringify(urls));
    //     }
    // ,
    // There is no more queued requests
    // onDrain: function() {
    //     process.exit();
    // }
});

// c.queue({
//     uri: 'http://bbs.byr.cn/board/Friends',
//     headers: {
//         'X-Requested-With': 'XMLHttpRequest'
//     }
// });
exports.queue = function(request) {
    var deferred = Q.defer();
    _c.queue(_.assign(request, {
        callback: function(error, result, $) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve({
                    result: result,
                    $: $
                });
            }
        }
    }));
    return deferred.promise;
}
