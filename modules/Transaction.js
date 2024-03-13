const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
    },
    date: {
        type: Date,
    },
    });

const Transaction = mongoose.model("transaction", transactionSchema);
module.exports = Transaction;