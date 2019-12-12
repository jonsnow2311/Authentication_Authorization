'use strict';

const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const config = require('../config/config.json');

exports.changePassword = async (_id, password, newPassword) => {
    
    const currentUser = await User.find({_id: _id});
    console.log(currentUser);
    

    const hashed_password = currentUser[0].hashed_password;
    console.log(hashed_password);
    

    const match = bcrypt.compare(password, hashed_password)
    if(match) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        currentUser[0].hashed_password = hash;

        await currentUser[0].save();

        return currentUser;
    } 

    else {
        let response = {
            status: 401,
            message: 'Invalid Old Password'
        };

        return response;
    }
    
}

exports.resetPasswordInit = async (_id) => {

    const random = randomstring.generate(8);
    const currentUser = await User.find({_id: _id});

    if(currentUser.length == 0)
    {
        const response = {
            status: 404,
            message: 'User Not Found'
        };
        return response;
    }
    else
    {
        let user = currentUser[0];
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(random, salt);

        user.temp_password = hash;
        user.temp_password_time = new Date();
        
        console.log(user.temp_password_time);
        

        const result = await user.save();
        
        const transporter = nodemailer.createTransport(`smtps://${config.email}:${config.password}@smtp.gmail.com`);
        const mailOptions = {

            from:`"${config.name}" <${config.email}>`,
            to: user.email,
            subject: 'Reset Password Request',
            html: `Hello ${user.name},
                    Your Reset password token is <b>${random}</b>.
                If you are viewing this mail from a Android Device click this <a href="https://localhost:8080/${random}">link</a>.
                The token is valid for only 2 minutes.
                
                Thanks,
                Abhijeet Chauhan.`
        };

        const info = await transporter.sendMail(mailOptions);

        console.log(info);
        const response = {
            status: 200,
            message: 'Check mail for instructions'
        };

        return response;

        
    }
}

exports.resetPassworFinish = async (_id , token , password) => {

    const currentUser = await User.find({_id: _id});

    console.log(currentUser);
    
    
    const user = currentUser[0];
    const now = new Date();

    //const seconds = (now.getMilliseconds() - user.temp_password_time.getMilliseconds())/1000;
    //console.log(`Seconds : ${seconds}`);

    if(true) {
        
        const com = await bcrypt.compare(token , user.temp_password);

        if(com) {

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            user.hashed_password = hash;
            user.temp_password = undefined;
            user.temp_password_time = undefined;

            const result = await user.save();

            const response = {
                status: 200,
                message: 'Password Changed Successfully'
            };

            return response;
        }

        else {
            const response = {
                status: 401,
                message: 'Invalid Token'
            };
            return response;
        }
        
    }
    else{
        const response = {
            status: 401,
            message: 'Time Out !! Try Again'
        };
        return response;
    }    
}
