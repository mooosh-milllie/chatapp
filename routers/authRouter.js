const router = require('express').Router();
const validateForm = require('../middlewares/validateForm');
const { initialLoginCheck, userLogin, userSignUp } = require('../controllers/authController');
const { authRateLimiter } = require('../middlewares/authRateLimiter');


router.route('/login')
.get(initialLoginCheck)
.post(validateForm, authRateLimiter(4, 60), userLogin)

router.post('/register', validateForm, authRateLimiter(4, 500), userSignUp)


module.exports = router;