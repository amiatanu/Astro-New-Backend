const Transaction = require('../models/Transaction');


exports.viewTransactions = async (req, res) => {
  try {
    const userId = req.user._id; 
    const transactions = await Transaction.find({ userId });
    res.render('view-transactions', { transactions });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


exports.viewCreditTransactions = async (req, res) => {
  try {
    const userId = req.user._id; 
    const transactions = await Transaction.find({ userId, type: 'credit' });
    res.render('view-credit-transactions', { transactions });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


exports.viewDebitTransactions = async (req, res) => {
  try {
    const userId = req.user._id; 
    const transactions = await Transaction.find({ userId, type: 'debit' });
    res.render('view-debit-transactions', { transactions });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
