const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    imageUrl : {
        type: String,
        required: true,
        unique: true
    },
    choosen_category: [
        {
            type: Schema.ObjectId,
            ref: 'Category'
        }
    ],
    library: [
        {
            type: Schema.ObjectId,
            ref: 'BookReport'
        }
    ],
    bookmarks:  [
        {
            type: Schema.ObjectId,
            ref: 'BookReport'
        }
    ]
});

module.exports = mongoose.model('User', userSchema);
