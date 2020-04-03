const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    const { imageUrl, name, email } = req.body.response.profileObj;

    try {
        await User.create({
            imageUrl,
            name,
            email
        })

        const token = await jwt.sign(
            { email },
            process.env.SECRET_KEY,
            { expiresIn: '7d' }
            
        );

        const choosenCategory = await User.findOne({ email }, 'choosen_category');
            
        res
        .status(200)
        .json({
            token,
            name,
            email,
            imageUrl,
            choosenCategory
        })
    } catch (error) {
        console.log('^^')
    }
});

router.get('/', (req, res, next) => {
});

module.exports = router;
