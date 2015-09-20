var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OutletsOwner = new Schema({
	userId: {
		type: Schema.Types.ObjectId, 
		ref: 'User',	
		required: true
	},
	outletId: {
		type: Schema.Types.ObjectId, 
		ref: 'Outlets',	
		required: true
	},
	
	outletOwnerCreated: {
        type: Date,
        default: Date.now
    }
	
});

module.exports = mongoose.model('OutletsOwner', OutletsOwner);
