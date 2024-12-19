import express from 'express';
import { getUsers, deleteUserAndMemos } from '../controllers/authController.js';
import { getMemos, getVoies } from '../controllers/memoController.js';

const router = express.Router();


router.get('/all', getUsers);
router.get('/allmemos', getMemos);
router.get('/allvoice', getVoies);
router.delete('/deleteUser/:userId', deleteUserAndMemos);


export default router;