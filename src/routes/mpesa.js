const express = require('express');
const router = express.Router();
const { stkPush, stkCallback, registerC2B, c2bValidate, c2bConfirm } = require('../controllers/mpesaController');
const authMiddleware = require('../middleware/auth');

router.post('/stk-push', authMiddleware, stkPush);
router.post('/callback', stkCallback);
router.post('/c2b/register', registerC2B);
router.post('/c2b/validate', c2bValidate);
router.post('/c2b/confirm', c2bConfirm);

module.exports = router;