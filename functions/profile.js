'use strict';

const user = require('../models/user');

exports.getProfile = async (_id) => {

    const currentUser = await user.find({_id: _id} , {name: 1 , email: 1, created_at: 1 , _id: 1});

    return currentUser;

}