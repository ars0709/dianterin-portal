var express         = require('express');
var mongoose        = require('mongoose');
var passport        = require('passport');
var router          = express.Router();
var libs            = process.cwd() + '/apps/';
var Products 		= require(libs + 'model/products');
var Outlets 		= require(libs + 'model/outlets');
var ProductReviews	= require(libs + 'model/productreviews');
var User			= require(libs + 'model/user');

function sleep(time, callback) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
    callback();
}

/* GET users listing. */
router.get('/', passport.authenticate('bearer', { session: false }), function (req, res) {
    res.json({
    	message: 'API is running'
    });
});

router.get('/product/:page', passport.authenticate('bearer', { session: false }), function (req, res) {
    
    var data = []
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

router.get('/product/id/:id', passport.authenticate('bearer', { session: false }), function (req, res) {
    
    var id = req.params.id;

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

                        res.json({
                            products: products,
                            reviewsFetchAll: resultAll,
                            reviewData: result
                        });
                    }
                );
            }
        );
        
    });
    
});

module.exports = router;
