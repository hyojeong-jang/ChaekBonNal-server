const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Category = require('../models/category');

router.put('/:user_id/category', async (req, res) => {
  const { user_id } = req.params;
  const { category } = req.body;
  const result = category.join(',');

  try {
    const choosenCategory = await Category.create({ name: category });
  
    await User.findOneAndUpdate(
      { name: user_id },
      { choosen_category: choosenCategory._id },
      { upsert: true, new: true }
    )
  
    res.status(200).json({ result });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
