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
            type: String
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
    ],
    refresh_token : {
        
    }
});

module.exports = mongoose.model('User', userSchema);
