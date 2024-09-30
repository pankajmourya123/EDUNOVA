import Book from '../models/Book.js';
import catchAsyncError from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/error.js';

// Get books by name or a search term
export const getBooksByName = catchAsyncError(async (req, res, next) => {
    const { name } = req.query;
    
    const books = await Book.find({ bookName: { $regex: name, $options: 'i' } });
    if (!books.length) {
        return next(new ErrorHandler('No books found with that name', 404));
    }

    res.status(200).json(books);
});

// Get books by rent range
export const getBooksByRentRange = catchAsyncError(async (req, res, next) => {
    const { minRent, maxRent } = req.query;

    const books = await Book.find({ rentPerDay: { $gte: minRent, $lte: maxRent } });
    if (!books.length) {
        return next(new ErrorHandler('No books found within that rent range', 404));
    }

    res.status(200).json(books);
});

// Get books by category, name, and rent range
export const getBooksByCategoryNameAndRent = catchAsyncError(async (req, res, next) => {
    const { category, name, minRent, maxRent } = req.query;

    const books = await Book.find({
        category,
        bookName: { $regex: name, $options: 'i' },
        rentPerDay: { $gte: minRent, $lte: maxRent }
    });

    if (!books.length) {
        return next(new ErrorHandler('No books found matching the criteria', 404));
    }

    res.status(200).json(books);
});


// Add Book
export const addBook = async (req, res) => {
    const { bookName, category, rentPerDay } = req.body;
    try {
        const newBook = new Book({ bookName, category, rentPerDay });
        await newBook.save();
        res.status(201).json({ message: 'Book added successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all books
export const getAllBooks = catchAsyncError(async (req, res, next) => {
    const books = await Book.find();

    if (!books.length) {
        return next(new ErrorHandler('No books found in the database', 404));
    }

    res.status(200).json(books);
});

// Get book details by ID
export const getBookById = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    const book = await Book.findById(id);
    if (!book) {
        return next(new ErrorHandler('Book not found', 404));
    }

    res.status(200).json(book);
});
// Delete Book
export const deleteBook = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    const deletedBook = await Book.findByIdAndDelete(id);
    if (!deletedBook) {
        return next(new ErrorHandler('Book not found', 404));
    }

    res.status(200).json({ message: 'Book deleted successfully' });
});
// Get rent history for a user
export const getRentHistoryByUser = catchAsyncError(async (req, res, next) => {
    const { userId } = req.params;

    const transactions = await Transaction.find({ userId }).populate('bookId');
    if (!transactions.length) {
        return next(new ErrorHandler('No rental history found for this user', 404));
    }

    res.status(200).json(transactions);
});
// Get all transactions
export const getAllTransactions = catchAsyncError(async (req, res, next) => {
    const transactions = await Transaction.find().populate('userId', 'name email phoneNumber');
    
    if (!transactions.length) {
        return next(new ErrorHandler('No transactions found', 404));
    }

    res.status(200).json(transactions);
});
