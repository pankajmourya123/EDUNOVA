import express from 'express';
import {
    issueBook,
    returnBook,
    getUsersByBook,
    getTotalRentByBook,
    getBooksIssuedToUser,
    getBooksIssuedInDateRange,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    getTransactionById,
    createTransaction
} from '../controllers/Transcation.js';
import catchAsyncError from '../middlewares/catchAsyncError.js';

const router = express.Router();

// Route to issue a book
router.post('/issue', issueBook);

// Route to return a book
router.post('/return', returnBook);

// Route to get users who issued a specific book
router.get('/users', getUsersByBook);

// Route to get total rent generated by a specific book
router.get('/rent-total', getTotalRentByBook);

// Route to get books issued to a user
router.get('/user-books', getBooksIssuedToUser);

// Route to get books issued in a specific date range
router.get('/issued', getBooksIssuedInDateRange);

// Route to add a new transaction
router.post('/transaction', addTransaction); // Consider updating the path for clarity.


// In Transaction.js
router.post('/transactions', createTransaction); // Create a new transaction
router.get('/transactions/:id', getTransactionById); // Get transaction by ID
router.put('/transactions/:id', updateTransaction); // Update transaction
router.delete('/transactions/:id', deleteTransaction); // Delete transaction

export default router;
