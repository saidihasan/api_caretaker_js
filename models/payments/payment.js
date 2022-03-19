const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentsSchema = new Schema(
  {
    _id: {
      required: true,
      type: String,
    },
    order_id: {
      required: true,
      type: String,
      ref: "orders",
    },
    payment_method: {
      required: true,
      type: Number,
    },
    payment_type: {
      required: true,
      type: String,
    },
    ammount: {
      required: true,
      type: Number,
    },
    xendit_id: {
      required: false,
      type: String,
    },
    payment_id: {
      required: false,
      type: String,
    },
    status: {
      required: true,
      type: Number,
      default: 1,
    },
    paid_date: {
      required: false,
      type: Date,
    },
    expired_date: {
      required: false,
      type: Date,
    },
  },
  { _id: false }
);

const Payment = mongoose.model("payments", paymentsSchema);

const StatusPayment = {
  STATUS_CREATED: 1,
  STATUS_ACTIVE: 2,
  STATUS_COMPLETE: 3,
  STATUS_EXPIRED: 4,
};

const PaymentMethod = {
  PAYMENT_E_WALLET: 0,
  PAYMENT_VIRTUAL_ACCOUNT: 1,
  PAYMENT_OUTLET: 2,
};

module.exports = {
  Payment,
  StatusPayment,
  PaymentMethod,
};
