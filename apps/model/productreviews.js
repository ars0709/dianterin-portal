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
		type: Number
	},
	reviewDateCreated: {
        type: Date,
        default: Date.now
    },
	productId: {
		type: Schema.Types.ObjectId, 
		ref: 'Products',	
		required: true
	},
	userId: {
		type: Schema.Types.ObjectId, 
		ref: 'User',	
		required: true
	}
});

module.exports = mongoose.model('ProductReviews', ProductReviews);
