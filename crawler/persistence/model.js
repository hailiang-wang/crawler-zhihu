/**
 * Add models
 */


/**
 * Schedule defined the auto generating jobs for tasks
 * @type {[type]}
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var common = require('../common');
var config = common.argv;
var _ = require('lodash');
var autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection);

/* http://mongoosejs.com/docs/guide.html */
var FriendsSchema = new Schema({
    server: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.Mixed
    },
    content: {
        type: Schema.Types.Mixed
    }
})

// FriendsSchema.plugin(autoIncrement.plugin, {
//     model: 'Schedule',
//     field: 'schedule_id',
//     startAt: 100
// });

// exports.FriendsSchema = FriendsSchema;
exports.Friends = mongoose.model('Friends', FriendsSchema);
