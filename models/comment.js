const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    comment: [
        {
            nickname: {
                type: String,
                required: true
            },
            comments: {
                type: String,
                required: true
            }
        }
    ]
});

module.exports = mongoose.model('Comment', commentSchema);
