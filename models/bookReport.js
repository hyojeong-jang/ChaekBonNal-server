const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookReportSchema = mongoose.Schema({
    image_url: String,
    report: String,
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    book_info: {
        title: {
            type: String,
            required: true
        },
        author: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        }
    },
    report_title: {
        type: String,
        required: true
    },
    quote: String,
    comments: {
        type: Schema.ObjectId,
        ref: 'Comment'
    }
});

module.exports = mongoose.model('BookReport', bookReportSchema);
