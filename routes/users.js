const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Category = require('../models/category');
const BookReport = require('../models/bookReport');

const axios = require('axios').default;
const jwt = require('jsonwebtoken');
const s3 = require('../config/S3');

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

  res.status(200).json({ result: KDC[isbnCategoryCode] });
})

router.post('/:user_id/book-report', async (req, res) => {
  const { selectedBook, selectedCategory, imageUrl, text, title, quote  } = req.body.data;
  const { user_id } = req.params;
  const author = await User.findOne({ name: user_id }, '_id');
 
  await BookReport.create({
    author: author._id,
    image_url: imageUrl,
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

router.post('/:user_token/writing/attaching-image', async (req, res) => {
  const { user_token } = req.params;
  const { url } = req.body.data;
  const { email } = jwt.verify(user_token, process.env.SECRET_KEY);

  const params = {
    Bucket: 'chaekbonnal',
    Key: `bookImage/${email}_${Date.now().toString()}`,
    ACL: 'public-read',
    Body: url,
    ContentEncoding: 'base64',
  }

  s3.upload(params, (err, data) => {
    if (err) {
      console.log(err, 'S3 ERROR')
    } else {
      const imageUrl = data.Location;
      res.status(200).json({ imageUrl })
    }
  })
})

module.exports = router;
