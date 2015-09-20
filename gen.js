var faker = require('faker');

var libs = process.cwd() + '/apps/';

var log = require(libs + 'log')(module);
var db = require(libs + 'db/mongoose');
var config = require(libs + 'config');

var User = require(libs + 'model/user');
var Client = require(libs + 'model/client');
var AccessToken = require(libs + 'model/accesstoken');
var RefreshToken = require(libs + 'model/refreshtoken');

User.remove({}, function(err) {
    var user = new User({
        username: config.get("default:user:username"),
        password: config.get("default:user:password"),
        email: config.get("default:user:email"),
        fullname: config.get("default:user:fullname"),
        gender: config.get("default:user:gender"),
        birthdate: config.get("default:user:birthdate"),
        phone: config.get("default:user:phone"),
        age: config.get("default:user:age"),
        city: config.get("default:user:city"),
        occupation: config.get("default:user:occupation"),
        register_via: config.get("default:user:register_via")
    });

    user.save(function(err, user) {
        if(!err) {
            log.info("New user - %s:%s", user.username, user.password);
        }else {
            return log.error(err);
        }
    });
});

Client.remove({}, function(err) {
    var client = new Client({
        name: config.get("default:client:name"),
        clientId: config.get("default:client:clientId"),
        clientSecret: config.get("default:client:clientSecret")
    });

    client.save(function(err, client) {

        if(!err) {
            log.info("New client - %s:%s", client.clientId, client.clientSecret);
        } else {
            return log.error(err);
        }

    });
});

AccessToken.remove({}, function (err) {
    if (err) {
        return log.error(err);
    }
});

RefreshToken.remove({}, function (err) {
    if (err) {
        return log.error(err);
    }
});

setTimeout(function() {
    db.disconnect();
}, 3000);
