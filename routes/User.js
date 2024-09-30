import express from 'express';
import {
    signup,
    login,
    getAllUsers
} from '../controllers/User.js';
import catchAsyncError from '../middlewares/catchAsyncError.js';

const router = express.Router();

// Route for user signup
router.post('/signup', signup);

// Route for user login
router.post('/login', login);

// Route to get all users
router.get('/all', getAllUsers);

export default router;
