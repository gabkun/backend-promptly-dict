import express from 'express';
import { login, register, fetchUserById, countTotalUsers, getUsers } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/:userId', fetchUserById);
router.get('/', countTotalUsers);
router.get('/all', getUsers);


export default router;