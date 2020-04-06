const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Category = require('../models/category');
const BookReport = require('../models/bookReport');

const axios = require('axios').default;
const jwt = require('jsonwebtoken');


const getCategory = (kdc) => {
  if (kdc === 0) return '총류';
  if (kdc === 1) return '철학';
  if (kdc === 2) return '종교';
  if (kdc === 3) return '사회과학';
  if (kdc === 4) return '자연과학';
  if (kdc === 5) return '기술과학';
  if (kdc === 6) return '예술';
  if (kdc === 7) return '언어';
  if (kdc === 8) return '문학';
  if (kdc === 9) return '역사';
}


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
  const isbnCategoryCode = Number(bookData.data.docs[0].EA_ADD_CODE.slice(2, 3));
  
  res.status(200).json({result: getCategory(isbnCategoryCode)});
})

router.post('/:user_id/book-report', async (req, res) => {
  const { selectedBook, selectedCategory, text, title, quote  } = req.body.data;
  const { user_id } = req.params;
  const author = await User.findOne({ name: user_id }, '_id');
 
  await BookReport.create({
    author: author._id,
    title,
    quote,
    text,
    book_info: {
      title: selectedBook.title,
      author: selectedBook.author,
      category: selectedCategory
    }
  })
  res.status(200).json({ result: 'ok' })
})

router.get('/:user_token/book-reports', async (req, res) => {
  const { user_token } = req.params;
  const { email } = jwt.verify(user_token, process.env.SECRET_KEY);

  const allBookReports = await BookReport.find({});

  const { choosen_category } = await User.findOne({ email },'choosen_category');
  const userSelectedCategory = await Category.find({ _id: choosen_category[0] });

  const temp = userSelectedCategory[0].name;
  const bookReports = [];

  allBookReports.forEach(el => {
    temp.forEach(selected => {
      if (String(el.book_info.category) === String(selected)) {
        bookReports.push(el);
      }
    })
  })

  res.status(200).json({ bookReports });
})

module.exports = router;
