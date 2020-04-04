const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    const { imageUrl, name, email } = req.body.response.profileObj;

    try {
        const userData = await User.findOneAndUpdate(
            { email },
            { imageUrl, name, email },
            { upsert: true }
        );

        const token = jwt.sign(
            { email },
            process.env.SECRET_KEY,
            { expiresIn: '7d' }
        );

        res.status(200).json({ token, userData });
    } catch (error) {
        console.log(error)
    }
});

router.get('/', (req, res, next) => {
});

module.exports = router;
