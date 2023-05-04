const express = require("express");
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const expressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const { reviewSchema } = require("../schemas.js")
const Review = require('../models/review.js')
const reviews = require('../controllers/review');
const {reviewValidation,isLoggedIn ,isReviewAuthor} = require('../middleware')



router.post("/", isLoggedIn, reviewValidation, catchAsync(reviews.createReview))

router.delete(("/:reviewId"), isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;