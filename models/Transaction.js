import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  bookName: { type: String, required: true },
  userId: { type: String, required: true },
  issueDate: { type: Date, required: true },
  returnDate: { type: Date },
  totalRent: { type: Number }
}, { timestamps: true });


const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
