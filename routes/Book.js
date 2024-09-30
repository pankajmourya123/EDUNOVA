import express from 'express';
import {
    getBooksByName,
    getBooksByRentRange,
    getBooksByCategoryNameAndRent,
    addBook,
    getAllBooks
} from '../controllers/Book.js';
import catchAsyncError from '../middlewares/catchAsyncError.js';

const router = express.Router();

// Route to get books by name or search term
router.get('/search', getBooksByName);

// Route to get books within a rent range
router.get('/rent', getBooksByRentRange);

// Route to get books by category, name, and rent range
router.get('/category', getBooksByCategoryNameAndRent);

// Route to add a new book
router.post('/add', addBook);

// Route to get all books
router.get('/books', getAllBooks);

export default router;
