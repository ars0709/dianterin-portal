var express     = require('express');
var passport    = require('passport');
var router      = express.Router();
var libs        = process.cwd() + '/apps/';
var db          = require(libs + 'db/mongoose');

router.get('/info', passport.authenticate('bearer', { session: false }),
    function(req, res) {

        res.json({
        	user_id: req.user.userId,
        	username: req.user.username,
            email: req.user.email,
            fullname: req.user.fullname,
            gender: req.user.gender,
            birthdate: req.user.birthdate,
            address: req.user.address,
            phone: req.user.phone,
            website: req.user.website,
            register_via: req.user.fullname,
        	scope: req.authInfo.scope
        });
    }
);

module.exports = router;
