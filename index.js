const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
const DB = process.env.MONGODB_CONNECTION_STRING;
mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Define the transaction schema
const transactionSchema = new mongoose.Schema({
  blockNumber: String,
  timeStamp: String,
  hash: String,
  nonce: String,
  blockHash: String,
  transactionIndex: String,
  from: String,
  to: String,
  value: String,
  gas: String,
  gasPrice: String,
  isError: String,
  txreceipt_status: String,
  input: String,
  contractAddress: String,
  cumulativeGasUsed: String,
  gasUsed: String,
  confirmations: String,
  methodId: String,
  functionName: String,
});

// Define the transaction model
const Transaction = mongoose.model("Transaction", transactionSchema);

// Create Express app
const app = express();
const port = 3000;

// Define the API route
app.get("/api/transactions/:address", async (req, res) => {
  try {
    const { address } = req.params;

    // Fetch transactions from Etherscan API
    const apiKey = "NK77YFGC9KCTN66V48E16WM3MQ9S9TGQ8I";
    const apiUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;
    const response = await axios.get(apiUrl);

    // Store transactions in the database
    const transactions = response.data.result;
    await Transaction.insertMany(transactions);

    // Return the transactions as the API response
    res.json(transactions);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
