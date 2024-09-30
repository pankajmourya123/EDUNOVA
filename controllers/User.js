import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import catchAsyncError from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/error.js';

// User Signup
export const signup = catchAsyncError(async (req, res, next) => {
    const { name, email, phoneNumber, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorHandler('User already exists', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, phoneNumber, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
});


export const login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    console.log("Email:", email);
    console.log("Entered password:", password);

    const user = await User.findOne({ email });
    if (!user) {
        console.log("User not found");
        return next(new ErrorHandler('Invalid credentials', 400));
    }

    console.log("User found:", user);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log("Password does not match");
        return next(new ErrorHandler('Invalid credentials', 400));
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    
    console.log("JWT Token:", token);

    res.status(200).json({ token });
});


// User Logout
export const logout = (req, res, next) => {
    try {
        // Clear token from local storage or session storage
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        next(new ErrorHandler(error.message, 500));
    }
};

// Get All Users
export const getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json(users);
});

// Get User Details
export const getUserById = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    res.status(200).json(user);
});
