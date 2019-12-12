'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({

    name : String,
    email : String,
    hashed_password : String,
    created_at : String,
    temp_password : String,
    temp_password_time : String
});

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/NodeLogin');



module.exports = mongoose.model('user' , userSchema);