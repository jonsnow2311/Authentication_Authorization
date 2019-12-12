'use strict';

const auth = require('basic-auth');
const jwt = require('jsonwebtoken');

const register = require('./functions/register');
const login = require('./functions/login');
const profile = require('./functions/profile');
const password = require('./functions/password');
const config = require('./config/config.json');

module.exports = router => {

    router.get('/', async (req,res) => res.end('Welcome to NodeLogin'));

    router.post('/authenticate', async (req,res) => {
        const credentials = auth(req);

        if(!credentials) {
            res.status(400).json({message: 'Invalid request'});
        }

        else {
            const response = await login.loginUser(credentials.name, credentials.pass);

            if(response.status == 200)
            {
                const token = jwt.sign({_id: response._id} , config.secret);
                res.setHeader('x-access-token' , token);
                res.status(200).json({message: response.message , _id: response._id});
            }
            else
            {
                res.status(response.status).json({message: 'Invalid request'});
            }
        }
    });

    router.post('/users',  (req, res) => {

		const name = req.body.name;
		const email = req.body.email;
		const password = req.body.password;

		if (!name || !email || !password || !name.trim() || !email.trim() || !password.trim()) {

			res.status(400).json({message: 'Invalid Request !'});

		} else {

			register.registerUser(name, email, password)

			.then(result => {

				res.setHeader('Location', '/users/'+email);
				res.status(result.status).json({ message: result.message });
			})

			.catch(err => res.status(500).json({ message: err.message }));
		}
	});

    router.get('/users/:id', async (req,res) => {
        if(checkToken(req)) {
            const response = await profile.getProfile(req.params.id);

            res.json(response);

        }
        else
        {
            res.status(401).json({message: 'Invalid TOken'});
        }
    });

    router.put('/users/:id', async (req,res) => {
        if(checkToken(req)) {
            const oldPassword = req.body.password;
            const newPassword = req.body.newPassword;

            if(!oldPassword || !newPassword || !oldPassword.trim() || !newPassword.trim()) {
                res.status(400).json({message: 'Invalid Request'});
            }
            else
            {
                const response = await password.changePassword(req.params.id, oldPassword, newPassword);

                if(response.status == 401)
                {
                    res.status(401).json({message: response.message});
                }
                else {
                    res.status(200).json(response);
                }
            }
        }
        else{
            res.status(401).json({message: 'Invalid Token'});
        }
    });

    router.post('/users/:id/password', async (req,res) => {
        const _id = req.params.id;
        const token = req.body.token;
        const newPassword = req.body.password;

        if(!token || !newPassword || !token.trim() || !newPassword.trim()) {
            const result = await password.resetPasswordInit(email);
            
            return res.status(result.status).json({message: result.message});
        }
        else{
            const result = await password.resetPassworFinish(_id, token , newPassword);

            return res.status(result.status).json({message: result.message});

        }
    });
}


function checkToken(req) {
    const token = req.headers['x-access-token'];

    //console.log(token);
    
    if(token) {

        try {
            const decoded = jwt.verify(token, config.secret);

            return (decoded._id===req.params.id);
        } catch(err) {
            return false;
        }
    } else {
        return false;
    }
}
