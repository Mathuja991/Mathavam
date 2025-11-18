const router = require('express').Router();
const { chat } = require('./ragController');

router.post('/chat', chat);

module.exports = router;
