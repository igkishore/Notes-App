const express = require('express');
const memberController = require('../controllers/membercontroller');
const { ensureAuthenticated } = require('../auth');
const router = express.Router();

router.get('/', memberController.dashboard_get);
router.get('/dashboard', memberController.dashboard_get);
router.get('/addnotes', memberController.addnotes_get);
router.get('/explore', memberController.explore_get);
router.get('/newnotes', memberController.newnotes_get);




module.exports = router;