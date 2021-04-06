const express = require('express');
const memberController = require('../controllers/membercontroller');
const { ensureAuthenticated } = require('../auth');
const router = express.Router();

router.get('/',ensureAuthenticated, memberController.dashboard_get);
router.get('/dashboard',ensureAuthenticated, memberController.dashboard_get);
router.get('/addnotes',ensureAuthenticated, memberController.addnotes_get);
router.get('/explore',ensureAuthenticated, memberController.explore_get);
router.post('/explore',ensureAuthenticated, memberController.explore_post_get);
router.get('/newnotes', ensureAuthenticated,memberController.newnotes_get);




module.exports = router;