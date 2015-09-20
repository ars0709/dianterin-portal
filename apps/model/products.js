var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Products = new Schema({
	productName: {
		type: String,	
		required: true
	},
	productPrice: {
		type: Number,	
		required: true
	},
	productImage: {
		type: String
	},
	productCreated: {
        type: Date,
        default: Date.now
    },
	outletInfo: {
		type: Schema.Types.ObjectId, 
		ref: 'Outlets'
	}
	
});

module.exports = mongoose.model('Products', Products);
