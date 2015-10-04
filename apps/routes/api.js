var express         = require('express');
var mongoose        = require('mongoose');
var passport        = require('passport');
var router          = express.Router();
var libs            = process.cwd() + '/apps/';
var Products 		= require(libs + 'model/products');
var Outlets 		= require(libs + 'model/outlets');
var ProductReviews	= require(libs + 'model/productreviews');
var User			= require(libs + 'model/user');

/* GET users listing. */
router.get('/', passport.authenticate('bearer', { session: false }), function (req, res) {
    res.json({
    	message: 'API is running'
    });
});

router.get('/product/:page', passport.authenticate('bearer', { session: false }), function (req, res) {
    
    var data = [];
    var perPage = 10, 
        page = Math.max(0, req.params.page);

    Products
        .find()
        .populate('outletInfo')
        .limit(perPage)
        .skip(perPage * page)
        .sort({
            productCreated: 'desc'
        })
        .exec(function(err, products) {
        if (err) {
            data.push({
                "valid" : false,
                "message" : err
            });
            res.json(data);
        }

        //res.json(products);
        
        Products.count().exec(function(err, count) {
            res.json({
                products: products,
                page: page,
                pages: Math.ceil(count / perPage)
            })
        })
    });

});

router.get('/product/get/:id/:userid', passport.authenticate('bearer', { session: false }), function (req, res) {
    var data = [];
    var id = req.params.id;
    var userid = req.params.userid;

    Products
        .findOne({ _id: id })
        .populate('outletInfo')
        .exec(function(err, products) {
        if (err) {
            data.push({
                "valid" : false,
                "message" : err
            });
            res.json(data);
        }

        var rules = [{'productId': mongoose.Types.ObjectId(id)}];

        ProductReviews.aggregate(
            [
                { $match: {$and: rules } },
                {
                    $group: {
                        _id: "$productId",
                        totalPeople: { "$sum": 1 },
                        totalStar: {$sum : "$reviewStar"},
                        averageStar: {$avg : "$reviewStar"}
                    }
                }
            ],
            function(err,resultAll){
                ProductReviews.aggregate(
                    [
                        { $match: {$and: rules } },
                        { 
                            $group: {
                                _id: {
                                    star: "$reviewStar"
                                },
                                peopleCount: { $sum: 1 },
                                starCount: { $sum: "$reviewStar" }
                            }
                        },
                        { 
                            $group: {
                                _id: "$_id.star",
                                totalPeopleStar: { $sum: "$peopleCount" },
                                totalPerStar: { $sum: "$starCount" },

                            }
                        },
                        { $sort: { "_id": -1 } },
                    ],
                    function(err,result){
                        req.io.sockets.emit('product', {
                            'message' : 'Bagian Detail Product ' + id
                        });

                        ProductReviews.findOne({productId: id, userId: userid}).exec(function(err, review) {
                            if (err) {
                                data.push({
                                    "valid" : false,
                                    "message" : err
                                });
                                res.json(data);
                            }

                            res.json({
                                products: products,
                                reviewsFetchAll: resultAll,
                                reviewData: result,
                                meReview: review
                            });
                        });
                    }
                );
            }
        );
        
    });
    
});

router.get('/user/:username', passport.authenticate('bearer', { session: false }), function (req, res) {
    var data = [];
    var username = req.params.username;
    User.findOne({ username: username }).exec(function(err, user) {
        if (err) {
            data.push({
                "valid" : false,
                "message" : err
            });
            res.json(data);
        }

        res.json(user);
    });
});

router.post('/rating/save', passport.authenticate('bearer', { session: false }), function (req, res) {
    var data = [];
    var reviewTitle  = req.body.review_title;
    var reviewComment = req.body.review_comment;
    var reviewStar = req.body.review_star;
    var productId = req.body.product_id;
    var userId = req.body.user_id;

    var review = new ProductReviews({
        reviewTitle: reviewTitle,
        reviewComment: reviewComment,
        reviewStar: reviewStar,
        productId: productId,
        userId: userId
    });

    ProductReviews.find({ productId: productId, userId: userId }).remove().exec();
    review.save(function(err) {
        if (err) {
            data.push({
                "valid" : false,
                "message" : err
            });
            res.json(data);
        }

        data.push({
            "valid": true,
            "message": "Terima kasih"
        });

        var rules   = [{'productId': mongoose.Types.ObjectId(productId)}];
        ProductReviews.aggregate(
            [
                { 
                    $match: {
                        $and: rules 
                    } 
                },{
                    $group: {
                        _id: "$productId",
                        totalPeople: { "$sum": 1 },
                        totalStar: {$sum : "$reviewStar"},
                        averageStar: {$avg : "$reviewStar"}
                    }
                }
            ],
            function(err,resultAll){
                ProductReviews.aggregate(
                    [
                        { 
                            $match: { $and: rules } 
                        },{ 
                            $group: {
                                _id: {
                                    star: "$reviewStar"
                                },
                                peopleCount: { $sum: 1 },
                                starCount: { $sum: "$reviewStar" }
                            }
                        },{ 
                            $group: {
                                _id: "$_id.star",
                                totalPeopleStar: { $sum: "$peopleCount" },
                                totalPerStar: { $sum: "$starCount" },

                            }
                        },{ 
                            $sort: { "_id": -1 } 
                        }
                    ],
                    function(err,result){

                        ProductReviews
                            .findOne({productId: productId, userId: userId})
                            .populate('userId')
                            .exec(function(err, review) {
                            if (err) {
                                data.push({
                                    "valid" : false,
                                    "message" : err
                                });
                                res.json(data);
                            }

                            req.io.sockets.emit('rating-product', {
                                productId: productId,
                                reviewsFetchAll: resultAll,
                                reviewData: result,
                                reviewComplete: review
                            });

                            res.json({
                                meReview: review
                            });
                        });
                    }
                );
            }
        );
    });
});

router.get('/rating/:id', passport.authenticate('bearer', { session: false }), function (req, res) {
    
    var data    = [];
    var id      = req.params.id;
    var rules   = [{'productId': mongoose.Types.ObjectId(id)}];

    ProductReviews.aggregate(
        [
            { 
                $match: {
                    $and: rules 
                } 
            },{
                $group: {
                    _id: "$productId",
                    totalPeople: { "$sum": 1 },
                    totalStar: {$sum : "$reviewStar"},
                    averageStar: {$avg : "$reviewStar"}
                }
            }
        ],
        function(err,resultAll){
            ProductReviews.aggregate(
                [
                    { 
                        $match: { $and: rules } 
                    },{ 
                        $group: {
                            _id: {
                                star: "$reviewStar"
                            },
                            peopleCount: { $sum: 1 },
                            starCount: { $sum: "$reviewStar" }
                        }
                    },{ 
                        $group: {
                            _id: "$_id.star",
                            totalPeopleStar: { $sum: "$peopleCount" },
                            totalPerStar: { $sum: "$starCount" },

                        }
                    },{ 
                        $sort: { "_id": -1 } 
                    }
                ],
                function(err,result){
                    req.io.sockets.emit('product', {
                        'message' : 'Bagian Detail Product ' + id
                    });

                    res.json({
                        reviewsFetchAll: resultAll,
                        reviewData: result
                    });
                }
            );
        }
    );
});

router.get('/comment/:productid/:page', passport.authenticate('bearer', { session: false }), function (req, res) {
    
    var data = [];
    var perPage = 10, 
        page = Math.max(0, req.params.page),
        productId = req.params.productid;

    ProductReviews
        .find({ 'productId': mongoose.Types.ObjectId(productId) })
        .populate('userId')
        .limit(perPage)
        .skip(perPage * page)
        .sort({
            reviewDateCreated: 'desc'
        })
        .exec(function(err, review) {
        if (err) {
            data.push({
                "valid" : false,
                "message" : err
            });
            res.json(data);
        }

        //res.json(products);
        
        ProductReviews.find({ 'productId': mongoose.Types.ObjectId(productId) }).count().exec(function(err, count) {
            res.json({
                review: review,
                page: page,
                pages: Math.ceil(count / perPage)
            })
        })
    });

});

module.exports = router;