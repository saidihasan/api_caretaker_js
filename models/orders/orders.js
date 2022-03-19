const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    _id: {
      required: true,
      type: String,
    },
    prefix: {
      required: true,
      type: String,
    },
    suffix: {
      required: true,
      type: Number,
    },
    user_id: {
      required: true,
      type: String,
      ref: "users",
    },
    date: {
      required: true,
      type: Date,
      default: Date.now(),
    },
    patient_id: {
      required: true,
      type: String,
      ref: "user_has_patients",
    },
    category_patient: {
      required: true,
      type: Number,
    },
    status: {
      required: true,
      type: Number,
      default: 1,
    },
  },
  { _id: false }
);

const Order = mongoose.model("orders", orderSchema);

const StatusOrder = {
  STATUS_PENDING: 1,
  STATUS_PROCESSING: 2,
  STATUS_PAID: 3,
  STATUS_COMPLETE: 4,
  STATUS_EXPIRED: 5,
  STATUS_CANCELLED: 6,
};

module.exports = {
  Order,
  StatusOrder,
};
