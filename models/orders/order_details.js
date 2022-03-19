const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderDetailSchema = new Schema(
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
    perawat_id: {
      required: true,
      type: String,
      ref: "perawat",
    },
    start_date: {
      required: true,
      type: Date,
    },
    durasi: {
      required: true,
      type: Number,
    },
    cuti: {
      required: true,
      type: Number,
    },
    harga: {
      required: true,
      type: Number,
    },
  },
  { _id: false }
);

const OrderDetail = mongoose.model("order_details", orderDetailSchema);
module.exports = OrderDetail;
