const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();
const User = require("./modules/User");
const Transaction = require("./modules/Transaction");

mongoose.connect(process.env.MONGODB_URI);

app.use(express.json());
app.use(cors());

app.post("/register", async (req, res) => {
  try {
    const { username, password, passwordVerify } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser === null) {
      // validation
      switch (true) {
        case !username || !password || !passwordVerify:
          return res.status(400).json({
            errorMessage: "Please enter all required fields.",
          });
        case password !== passwordVerify:
          return res.status(400).json({
            errorMessage: "Please enter the same password twice.",
          });
        default:
          break;
      }

      // hash the password
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);

      // create a new user instance
      const newUser = new User({
        username,
        password: passwordHash,
      });

      // save the user to the database
      await newUser.save();
      res.send(newUser);
    } else {
      return res.status(400).json({
        errorMessage: "User already exists.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    switch (true) {
      case !user:
        return res.status(400).json({
          errorMessage: "Invalid username or password.",
        });
      case !(await bcrypt.compare(password, user.password)):
        return res.status(400).json({
          errorMessage: "Invalid username or password.",
        });
      default:
        // TODO: Generate and send a JWT token for authentication
        res.send("Login successful");
        break;
    }
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// Create a new spent transaction
app.post("/spent", async (req, res) => {
  try {
    const { name, amount, category } = req.body;
    const date = new Date(); // Get current system date
    const newTransaction = new Transaction({
      name,
      amount,
      category,
      date,
    });
    await newTransaction.save();
    res.send(newTransaction);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// Get all spent transactions
app.get("/spent", async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.send(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// Edit a spent by id
app.put("/spent/:id", async (req, res) => {
  try {
    const { name, amount, category } = req.body;
    const date = new Date();
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id },
      { name, amount, category, date }
    );
    res.send("Valor atualizado com sucesso!");
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// Delete a spent by id
app.delete("/transaction/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
    });
    res.send("Valor deletado com sucesso!");
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// Create a new income transaction
app.post("/income", async (req, res) => {
  try {
    const { name, amount } = req.body;
    const category = "income";
    const date = new Date(); // Get current system date
    const newTransaction = new Transaction({
      name,
      amount,
      category,
      date,
    });
    await newTransaction.save();
    res.send(newTransaction);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server has started on port ${process.env.SERVER_PORT}`);
});
