/**
 * Test services/byr.board.friend.js
 */
var assert = require('assert'),
    should = require('should'),
    crawler = require('../services/crawler'),
    byr_board_friend = require('../services/byr.board.friends.js');

describe('BYR board friends', function() {
    this.timeout(5000);

    it('should resolve topic body', function(done) {
        // 指定的文章不存在或链接错误
        // byr_board_friend.resolveTopicBody('/article/Friends/1638263')
        // 正常的文章
        byr_board_friend.resolveTopicBody('/article/Friends/1639595')
            .then(function(response) {
            	should.exist(response.authorName);
            	should.exist(response.authorLink);
            	should.exist(response.authorAvatar);
            	should.exist(response.body);
                done();
            })
            .fail(function(err) {
                done(err);
            });

    });
});
