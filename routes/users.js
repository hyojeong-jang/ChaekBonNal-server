const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Category = require('../models/category');
const axios = require('axios').default;

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

router.get('/:user_id/writing/book-search/:search_word', async (req, res) => {
  const { search_word } = req.params;
  
  try {
    const bookInfo = await axios.get('https://openapi.naver.com/v1/search/book.json',{
      headers: {
        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET
      },
      params: {
        query: search_word
      }
    });

    res.json({ result: bookInfo.data.items });
  } catch (error) {
    console.log(error)
  }
})

router.get('/:user_id/writing/isbn-search/:isbn', async (req, res) => {
  const { isbn } = req.params;
  const isbn13 = isbn.slice(11,24)
  const bookData = await axios.get(process.env.NATIONAL_LIBRARY_OF_KOREA_URL+isbn13)
  const isbnAddCode = bookData.data.docs[0].EA_ADD_CODE;
})

module.exports = router;
