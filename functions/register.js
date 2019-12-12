'use strict';

const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.registerUser =  (name, email, password) => 

new Promise((resolve,reject) => {

    const salt = bcrypt.genSaltSync(10);
    console.log(password);
    
    const hash = bcrypt.hashSync(password, salt);

    const newUser = new User({

        name: name,
        email: email,
        hashed_password: hash,
        created_at: new Date()
    });

    newUser.save()

    .then(() => resolve({ status: 201, message: 'User Registered Sucessfully !' }))

    .catch(err => {

        if (err.code == 11000) {

            reject({ status: 409, message: 'User Already Registered !' });

        } else {

            reject({ status: 500, message: 'Internal Server Error !' });
        }
    });
});