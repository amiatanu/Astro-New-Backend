const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//get wallet balance of user by userId
async function getWalletBalance(req, res) {
  try {
    const { userId } = req.params;

    // Find the user by their ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found", status: false });
    }

    // Get the user's wallet balance
    const walletBalance = user.wallet.balance;

    return res.status(200).json({ userId, walletBalance, status: true });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to get wallet balance", status: false });
  }
}

//create order for payment
async function createPaymentOrder(req, res) {
  try {
    const { userId, amount } = req.body;

    // Retrieve the user from your database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found", status: false });
    }

    // Create a Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert amount to paisa
      currency: "INR", // Use the appropriate currency code
      receipt: `wallet_recharge_${userId}`, // A unique receipt ID
    });

    const orderId = order.id;

    return res.status(200).json({
      orderId,
      amount,
      status: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to create Razorpay order",
      details: error.message,
      status: false,
    });
  }
}

//add money to wallet if payment successfull (call this after payment)
async function addMoneyToWallet(req, res) {
  try {
    // Verify the payment signature
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
    } = req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    console.log(razorpay_order_id.status);

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_ID)
      .update(sign.toString())
      .digest("hex");
    //find user
    const user = await User.findById(userId);
    //validation
    if (razorpay_signature === expectedSign && user) {
      if (!user) {
        return res.status(404).json({ error: "User not found", status: false });
      }

      // Update the user's wallet balance (now in test)
      if (user) {
        const paymentAmount = order.amount / 100;
        user.wallet.balance += paymentAmount;
        await user.save();

        // Create a transaction record
        const transaction = new Transaction({
          userId: userId,
          walletId: user.wallet.walletId,
          amount: paymentAmount,
          type: "credit",
        });
        await transaction.save();

        return res
          .status(200)
          .json({ message: "Payment confirmed", status: true });
      }
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }

    /* const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found", status: false });
    }

    // Update the user's wallet balance (now in test)
    if (user && order.status === "created") {
      const paymentAmount = order.amount / 100;
      user.wallet.balance += paymentAmount;
      await user.save();

      // Create a transaction record
      const transaction = new Transaction({
        userId: userId,
        walletId: user.wallet.walletId,
        amount: paymentAmount,
        type: "credit",
      });
      await transaction.save();

      return res
        .status(200)
        .json({ message: "Payment confirmed", status: true });
    } */
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Failed to confirm payment", status: false });
  }
}

//get transaction details
async function getTransactionDetails(req, res) {
  try {
    const { userId } = req.params;

    // Find transactions by userId
    const transactions = await Transaction.find({ userId });

    if (!transactions || transactions.length === 0) {
      return res
        .status(404)
        .json({ error: "No transactions found", status: false });
    }

    return res.status(200).json({ transactions, status: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to get transactions",
      details: error.message,
      status: false,
    });
  }
}

//get credit transactions
async function getCreditTransactions(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ error: "userID is required", status: false });
    }
    // Find credit transactions by userId
    const creditTransactions = await Transaction.find({
      userId,
      type: "credit",
    });

    if (!creditTransactions || creditTransactions.length === 0) {
      return res
        .status(404)
        .json({ error: "No credit transactions found", status: false });
    }

    return res.status(200).json({ creditTransactions, status: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to get credit transactions",
      details: error.message,
      status: false,
    });
  }
}
//get debit transactions
async function getDebitTransactions(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ error: "userID is required", status: false });
    }

    // Find debit transactions by userId
    const debitTransactions = await Transaction.find({
      userId,
      type: "debit",
    });

    if (!debitTransactions || debitTransactions.length === 0) {
      return res
        .status(404)
        .json({ error: "No debit transactions found", status: false });
    }

    return res.status(200).json({ debitTransactions, status: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to get debit transactions",
      details: error.message,
      status: false,
    });
  }
}

module.exports = {
  getWalletBalance,
  getTransactionDetails,
  addMoneyToWallet,
  createPaymentOrder,
  getCreditTransactions,
  getDebitTransactions,
};
