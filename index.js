const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const cron = require("node-cron");
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

// Define the Ethereum price schema
const ethereumPriceSchema = new mongoose.Schema({
  price: Number,
  timestamp: Date,
});

// Define the Ethereum price model
const EthereumPrice = mongoose.model("EthereumPrice", ethereumPriceSchema);

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

// Define the Ethereum price fetching and storing task
cron.schedule("*/10 * * * *", async () => {
  try {
    // Fetch Ethereum price from CoinGecko API
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );

    // Store the Ethereum price in the database
    const price = response.data.ethereum.usd;
    const priceData = { price: price, timestamp: new Date() };
    await EthereumPrice.create(priceData);
  } catch (error) {
    console.error("Error:", error.message);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
