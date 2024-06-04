const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("./modules/User");
const Transaction = require("./modules/Transaction");

mongoose.connect(process.env.MONGODB_URI);

app.use(express.json());
app.use(cors());

app.post("/register", async (req, res) => {
  try {
    const { email, password, passwordVerify } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser === null) {
      // validation
      switch (true) {
        case !email || !password || !passwordVerify:
          return res.status(400).json({
            errorMessage: "Porfavor, preencha todos os campos.",
          });
        case password !== passwordVerify:
          return res.status(400).json({
            errorMessage: "Porfavor, digite a mesma senha duas vezes",
          });
        default:
          break;
      }

      // hash the password
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);

      // create a new user instance
      const newUser = new User({
        email,
        password: passwordHash,
      });

      // save the user to the database
      await newUser.save();
      res.send(newUser);
    } else {
      return res.status(400).json({
        errorMessage: "Usuário já cadastrado.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

function authenticateToken(req, res, next) {
  const token = req.headers["x-acess-authorization"];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    switch (true) {
      case !user:
        return res.status(400).json({
          errorMessage: "E-mail ou senha inválidos.",
        });
      case !(await bcrypt.compare(password, user.password)):
        return res.status(400).json({
          errorMessage: "E-mail ou senha inválidos.",
        });
      default:
        jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET,
          { expiresIn: "1h" },
          (err, token) => {
            if (err) {
              console.error(err);
              res.status(500).send();
            }
            res.status(200).json({data: { id: user._id, token }});
          }
        );
        break;
    }
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// Create a new spent transaction
app.post("/:type/register/:id", authenticateToken, async (req, res) => {
  const type = req.params.type;

  try {
    const { name, amount, description, category } = req.body;
    const date = new Date(); // Get current system date
    const newTransaction = new Transaction({
      name,
      amount,
      category,
      description,
      date,
      userID: req.params.id,
    });
    if (type === "spent") {
      newTransaction.type = 0;
    } else if (type === "income") {
      newTransaction.type = 1;
    }
    await newTransaction.save();
    res.send(newTransaction);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// Get all spent transactions
app.get("/:type/index/:id", authenticateToken, async (req, res) => {
  const typeTransaction = req.params.type;
  var type = 0;

  if (typeTransaction === "spent") {
    type = 0;
  } else if (typeTransaction === "income") {
    type = 1;
  } else {
    return res.status(400).json({ message: "Tipo de transação inválido" });
  }

  try {
    const transactions = await Transaction.find({
      userID: req.params.id,
      type: type,
    });
    return res.send(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// Edit a spent by id
app.put("/transaction/:id", authenticateToken, async (req, res) => {
  try {
    const { name, amount, category } = req.body;
    const date = new Date();
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id },
      { name, amount, category, date }
    );

    if (transaction === null)
      return res.status(404).json({ message: "Transação não encontrada" });

    res.json({ message: "Valor atualizado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// Delete a spent by id
app.delete("/transaction/delete/:id", authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
    });

    if (transaction === null)
      return res.status(404).json({ message: "Transação não encontrada" });

    res.json({ message: "Valor deletado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// Get total amount of transactions
app.get("/amount/:id", authenticateToken, async (req, res) => {
  try {
    const spentTransactions = await Transaction.find({
      userID: req.params.id,
      type: 0,
    });
    const totalSpent = spentTransactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );
    const incomeTransactions = await Transaction.find({
      userID: req.params.id,
      type: 1,
    });
    const totalIncome = incomeTransactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );
    res.send({ totalSpent, totalIncome });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server has started on port ${process.env.SERVER_PORT}`);
});
