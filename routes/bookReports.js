const express = require('express');
const router = express.Router();
const User = require('../models/user');
const BookReport = require('../models/bookReport');
const { authorization } = require('../middlewares/authorization');

router.get('/:report_id', async (req, res) => {
    const { report_id } = req.params;

    try {
        const bookReport = await BookReport.findById(report_id);
        res.status(200).json({ success: true, bookReport });
    } catch (error) {
        res.status(400).json({ success: false })
    }
});

router.put('/:report_id/users/:user_id/bookmark', authorization, async (req, res) => {
    const { email } = res.locals;
    const { report_id } = req.params;
    const { isBookmarked } = req.body;
    console.log(isBookmarked)
    try {
        if (isBookmarked) {
            await User.findOneAndUpdate(
                { email },
                { $addToSet: { bookmarks: report_id } }
            );

            res.status(200).json({ isBookmarked: true });
        } else {
            await User.findOneAndUpdate(
                { email },
                { $pull: { bookmarks: report_id } },
            )
 
            res.status(200).json({ isBookmarked: false });
        }
    } catch (error) {
        res.status(500).json({ success: false });
    }

})

module.exports = router;