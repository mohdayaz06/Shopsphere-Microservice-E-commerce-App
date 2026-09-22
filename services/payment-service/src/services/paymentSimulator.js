const { v4: uuidv4 } = require('uuid');
const paymentModel = require('../models/paymentModel');

/**
 * Generates a realistic-looking but entirely fake masked reference for the
 * given payment method. Nothing here is a real card/UPI/bank identifier -
 * this exists purely so the UI has something plausible to display.
 */
const generateMaskedReference = (method) => {
  switch (method) {
    case 'CARD': {
      const last4 = String(Math.floor(1000 + Math.random() * 9000));
      const brands = ['VISA', 'MASTERCARD', 'RUPAY'];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      return `${brand} \u2022\u2022\u2022\u2022 ${last4}`;
    }
    case 'UPI': {
      const id = Math.random().toString(36).slice(2, 8);
      return `${id}@simulatedbank`;
    }
    case 'NET_BANKING': {
      const banks = ['State Bank', 'HDFC', 'ICICI', 'Axis Bank'];
      return banks[Math.floor(Math.random() * banks.length)];
    }
    case 'COD':
    default:
      return null;
  }
};

/**
 * Simulates processing a payment for an order. This is a deliberate
 * stand-in for a real gateway (Stripe/Razorpay/etc.) - it never touches
 * real financial rails or stores real card data, but it mimics the shape
 * of a real integration: PENDING -> PROCESSING -> SUCCESS/FAILED, with a
 * configurable random failure rate so the frontend's failure-handling UI
 * has something real to exercise.
 */
const processPayment = async ({ orderId, userId, amount, method }) => {
  const transactionRef = uuidv4();

  // Cash on delivery never "processes" now - it's settled at delivery time.
  if (method === 'COD') {
    return paymentModel.create({
      orderId,
      userId,
      amount,
      method,
      status: 'PENDING',
      maskedReference: null,
      transactionRef,
    });
  }

  const payment = await paymentModel.create({
    orderId,
    userId,
    amount,
    method,
    status: 'PROCESSING',
    maskedReference: generateMaskedReference(method),
    transactionRef,
  });

  const failureRate = Number(process.env.SIMULATED_FAILURE_RATE || 0.05);
  const didFail = Math.random() < failureRate;

  if (didFail) {
    const reasons = [
      'Card declined by issuing bank',
      'Insufficient funds',
      'Payment gateway timeout',
      'Bank server unavailable',
    ];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    return paymentModel.updateStatus(payment.id, 'FAILED', { failureReason: reason });
  }

  return paymentModel.updateStatus(payment.id, 'SUCCESS');
};

const refundPayment = async (paymentId) => {
  const payment = await paymentModel.findById(paymentId);
  if (!payment) {
    const err = new Error('Payment not found');
    err.statusCode = 404;
    throw err;
  }
  if (payment.status !== 'SUCCESS') {
    const err = new Error('Only successful payments can be refunded');
    err.statusCode = 409;
    throw err;
  }
  return paymentModel.updateStatus(paymentId, 'REFUNDED');
};

module.exports = { processPayment, refundPayment };
