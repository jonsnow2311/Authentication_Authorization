'use strict'

const user = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.loginUser = async (email , password ) => {
    let response = {
        status: 200,
        message: email,
        _id: undefined
    };

    let currentUser = await user.find({email: email});
    if(currentUser.length == 0) {
        response.status = 404;
        response.message = 'User Not found';

        return response;
    }

    const hashed_password = currentUser[0].hashed_password;
    const result = await bcrypt.compare( password, hashed_password);
    if(result) {
        response._id = currentUser[0]._id;
        return response;
    }
    else {
        response.status = 401;
        response.message = 'Invalid Credentials';

        return response;
    }

}