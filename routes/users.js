const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.put('/:user_id/category', async (req, res, next) => {
  const { user_id } = req.params;
  const { category } = req.body;

  try {
    await User.findOneAndUpdate(
      { email: user_id },
      { choosen_category: category },
      { upsert: true }
    )
    res.status(200)
  } catch (error) {
    console.log('^^')
  }
});

module.exports = router;
