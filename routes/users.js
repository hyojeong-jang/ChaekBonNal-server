const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Category = require('../models/category');
const BookReport = require('../models/bookReport');
const { authorization } = require('../middlewares/authorization');

const axios = require('axios').default;
// const jwt = require('jsonwebtoken');
const s3 = require('../config/S3');
const multer  = require('multer');
const multerS3 = require('multer-s3');
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'chaekbonnal',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `bookImage/${Date.now().toString()}.jpg`)
    }
  })
});

const KDC = {
  0: '총류',
  1: '철학',
  2: '종교',
  3: '사회과학',
  4: '자연과학',
  5: '기술과학',
  6: '예술',
  7: '언어',
  8: '문학',
  9: '역사'
};

router.get('/:user_id', authorization, async (req, res) => {
  const { email } = res.locals;
  try {
    const userData = await User.findOne({ email });
   
    res.status(200).json({ userData });
  } catch (error) {
    res.status(500).json({ success: false });
  }
})

router.get('/:user_id/library', authorization, async (req, res) => {
  const { email } = res.locals;
  try {
    const { _id } = await User.findOne({ email }, '_id')
    const userLibrary = await BookReport.find({ author: _id });

    res.status(200).json({ userLibrary });
  } catch (error) {
    res.status(500).json({ success: false });
  }
})

router.get('/:user_id/bookmarks', authorization, async (req, res) => {
  const { email } = res.locals;
  try {
    const { bookmarks } = await User.findOne({ email }, 'bookmarks');
    const userBookmarks = await BookReport.find({ '_id': { $in: bookmarks } });

    res.status(200).json({ userBookmarks });
  } catch (error) {
    res.status(500).json({ success: false });
  }
})

router.put('/:user_id/category', async (req, res) => {
  const { user_id } = req.params;
  const { category } = req.body;
  const result = category.join(',');

  try {
    const { _id } = await Category.create({ name: category });
  
    await User.findOneAndUpdate(
      { name: user_id },
      { choosen_category: _id },
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
  const isbn13 = isbn.slice(11,24);
  const bookData = await axios.get(process.env.NATIONAL_LIBRARY_OF_KOREA_URL + isbn13);
  const isbnCategoryCode = Number(bookData.data.docs[0].EA_ADD_CODE.slice(2, 3));

  res.status(200).json({ result: KDC[isbnCategoryCode] });
});

router.post('/:user_id/book-report', async (req, res) => {
  const { selectedBook, selectedCategory, imageUrl, text, title, quote  } = req.body.data;
  const { user_id } = req.params;
  const { _id } = await User.findOne({ name: user_id }, '_id');
 
  await BookReport.create({
    author: _id,
    image_url: imageUrl,
    title,
    quote,
    text,
    book_info: {
      title: selectedBook.title,
      author: selectedBook.author,
      category: selectedCategory
    }
  });
  res.status(200).json({ result: 'ok' });
});


router.get('/:user_id/book-reports', authorization, async (req, res) => {
  const { email } = res.locals;

  const allBookReports = await BookReport.find({});
  const { choosen_category } = await User.findOne({ email },'choosen_category');
  const userSelectedCategory = await Category.find({ _id: choosen_category[0] });

  const selectedCategory = userSelectedCategory[0].name;
  const bookReports = [];

  allBookReports.forEach(el => {
    selectedCategory.forEach(category => {
      if (el.book_info.category === category) {
        bookReports.push(el);
      }
    });
  });

  res.status(200).json({ bookReports });
});

router.post('/:user_token/writing/attaching-image', upload.single('photo'), async (req, res) => {
  res.json({ success: true, imageUrl: req.file.location });
});

module.exports = router;
