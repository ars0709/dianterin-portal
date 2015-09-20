var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Outlets = new Schema({
	outletName: {
		type: String,	
		required: true
	},
	outletAddress: {
		type: String,	
		required: true
	},
	outletDesc: {
		type: String
	},
	outletImage: {
		type: String
	},
	outletDistance: {
		type: String,
		required: true
	},
	outletDateCreated: {
        type: Date,
        default: Date.now
    }
	
});

module.exports = mongoose.model('Outlets', Outlets);
