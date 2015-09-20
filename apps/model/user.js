var mongoose = require('mongoose');
var crypto = require('crypto');

var Schema = mongoose.Schema;

var User = new Schema({
	username: {
		type: String,
		unique: true,
		required: true
	},
	hashedPassword: {
		type: String,
		required: true
	},
	salt: {
		type: String,
		required: true
	},
	email: {
        type: String,
        unique: true,
        required: true
    },
	fullname: {
        type: String,
        required: true
    },
    gender: String,
    birthdate: Date,
    phone: String,
    age: String,
    city: String,
    occupation: String,
    register_via: String,
	created: {
		type: Date,
		default: Date.now
	}
});

User.methods.encryptPassword = function(password) {
	return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    //more secure - return crypto.pbkdf2Sync(password, this.salt, 10000, 512);
};

User.virtual('userId').get(function () {
	return this.id;
});

User.virtual('password').set(function(password) {
	this._plainPassword = password;
	this.salt = crypto.randomBytes(32).toString('base64');
	//more secure - this.salt = crypto.randomBytes(128).toString('base64');
	this.hashedPassword = this.encryptPassword(password);
});

User.virtual('password').get(function() {
	return this._plainPassword;
});


User.methods.checkPassword = function(password) {
	return this.encryptPassword(password) === this.hashedPassword;
};

module.exports = mongoose.model('User', User);
