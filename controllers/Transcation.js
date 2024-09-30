import Transaction from '../models/Transaction.js';
import Book from '../models/Book.js';
import catchAsyncError from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/error.js';

// Issue a book
export const issueBook = catchAsyncError(async (req, res, next) => {
    const { bookName, userId, issueDate } = req.body;

    const bookExists = await Book.findOne({ bookName });
    if (!bookExists) {
        return next(new ErrorHandler('Book not found', 404));
    }

    const transaction = new Transaction({ bookName, userId, issueDate });
    await transaction.save();
    res.status(201).json(transaction);
});

// Return a book
export const returnBook = catchAsyncError(async (req, res, next) => {
    const { bookName, userId, returnDate } = req.body;

    const transaction = await Transaction.findOne({ bookName, userId, returnDate: null });
    if (!transaction) {
        return next(new ErrorHandler('Transaction not found', 404));
    }

    const issueDate = transaction.issueDate;
    const rentPerDay = await Book.findOne({ bookName }).select('rentPerDay');
    if (!rentPerDay) {
        return next(new ErrorHandler('Book not found to calculate rent', 404));
    }

    const totalRent = Math.ceil((new Date(returnDate) - new Date(issueDate)) / (1000 * 60 * 60 * 24)) * rentPerDay.rentPerDay;
    transaction.returnDate = returnDate;
    transaction.totalRent = totalRent;

    await transaction.save();
    res.status(200).json(transaction);
});

// Get list of users who issued a book
export const getUsersByBook = catchAsyncError(async (req, res, next) => {
    const { bookName } = req.query;

    const transactions = await Transaction.find({ bookName });
    if (!transactions.length) {
        return next(new ErrorHandler('No transactions found for this book', 404));
    }

    const users = transactions.map(transaction => transaction.userId);
    res.status(200).json({ users, count: users.length });
});

// Get total rent generated by a book
export const getTotalRentByBook = catchAsyncError(async (req, res, next) => {
    const { bookName } = req.query;

    const totalRent = await Transaction.aggregate([
        { $match: { bookName } },
        { $group: { _id: null, total: { $sum: '$totalRent' } } }
    ]);
    
    if (!totalRent.length) {
        return next(new ErrorHandler('No rent generated for this book', 404));
    }

    res.status(200).json(totalRent[0].total);
});

// Get list of books issued to a user
export const getBooksIssuedToUser = catchAsyncError(async (req, res, next) => {
    const { userId } = req.query;

    const transactions = await Transaction.find({ userId });
    if (!transactions.length) {
        return next(new ErrorHandler('No books found for this user', 404));
    }

    const books = transactions.map(transaction => transaction.bookName);
    res.status(200).json({ books });
});

// Get books issued in a date range
export const getBooksIssuedInDateRange = catchAsyncError(async (req, res, next) => {
    const { start, end } = req.query;

    const transactions = await Transaction.find({
        issueDate: { $gte: new Date(start), $lte: new Date(end) }
    });
    
    if (!transactions.length) {
        return next(new ErrorHandler('No books issued in the given date range', 404));
    }

    res.status(200).json(transactions);
});

export const addTransaction = async (req, res) => {
    try {
        const { bookId, userId } = req.body;

        // Create a new transaction
        const newTransaction = new Transaction({
            bookId,
            userId,
            rentalDate: new Date(),
        });

        await newTransaction.save();

        return res.status(201).json({
            success: true,
            message: 'Transaction added successfully!',
            transaction: newTransaction,
        });
    } catch (error) {
        console.error('Error adding transaction:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add transaction',
            error: error.message,
        });
    }
};

// Create a new transaction (Rent a book)
export const createTransaction = catchAsyncError(async (req, res, next) => {
    const { userId, bookId, rentalPeriod } = req.body;

    // Validate inputs (e.g., check if the book is available)
    const book = await Book.findById(bookId);
    if (!book) {
        return next(new ErrorHandler('Book not found', 404));
    }

    // Ensure that the book object has the required fields
    console.log("Fetched Book:", book); // Debugging line to see fetched book

    // Create a new transaction with bookName and issueDate
    const transaction = await Transaction.create({
        bookName: book.bookName, // Use the bookName from the fetched book object
        userId,
        issueDate: new Date(), // Set current date as issue date
        returnDate: new Date(Date.now() + rentalPeriod * 24 * 60 * 60 * 1000), // Calculate return date
        totalRent: rentalPeriod * book.rentPerDay // Calculate total rent using rentPerDay from book
    });

    // Log transaction details for debugging
    console.log("Transaction Created:", transaction);
    
    res.status(201).json({ message: 'Book rented successfully', transaction });
});


// Get transaction by ID
export const getTransactionById = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    const transaction = await Transaction.findById(id)
        .populate('userId', 'name email') // Populate user details
        .populate('bookId', 'bookName'); // Populate book details

    if (!transaction) {
        return next(new ErrorHandler('Transaction not found', 404));
    }

    res.status(200).json(transaction);
});

// Update transaction (extend rental period)
export const updateTransaction = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const { rentalPeriod } = req.body;

    const updatedTransaction = await Transaction.findByIdAndUpdate(
        id,
        {
            rentalPeriod,
            returnDate: new Date(Date.now() + rentalPeriod * 24 * 60 * 60 * 1000) // Update return date
        },
        { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
        return next(new ErrorHandler('Transaction not found', 404));
    }

    res.status(200).json({ message: 'Transaction updated successfully', updatedTransaction });
});

// Delete transaction
export const deleteTransaction = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    const deletedTransaction = await Transaction.findByIdAndDelete(id);
    if (!deletedTransaction) {
        return next(new ErrorHandler('Transaction not found', 404));
    }

    res.status(200).json({ message: 'Transaction deleted successfully' });
});
