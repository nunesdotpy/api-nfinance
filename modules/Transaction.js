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
    description: {
        type: String,
    },
    category: {
        type: String,
    },
    type: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
    },
    userID: {
        type: String,
        required: true,
    },
    });

const Transaction = mongoose.model("transaction", transactionSchema);
module.exports = Transaction;