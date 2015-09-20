var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductReviews = new Schema({
	reviewTitle: {
		type: String
	},
	reviewComment: {
		type: String
	},
	reviewStar: {
		type: String
	},
	reviewDateCreated: {
        type: Date,
        default: Date.now
    },
	productId: {
		type: Schema.Types.ObjectId, 
		ref: 'Products',	
		required: true
	}
	
});

module.exports = mongoose.model('ProductReviews', ProductReviews);
