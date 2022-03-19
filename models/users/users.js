const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    _id: {
      required: true,
      type: String,
    },
    nik: {
      required: true,
      type: String,
    },
    nama: {
      required: true,
      type: String,
    },
    email: {
      required: true,
      type: String,
    },
    phone_number: {
      required: true,
      type: String,
    },
    address: {
      required: true,
      type: String,
    },
    province: {
      required: true,
      type: String,
    },
    district: {
      required: true,
      type: String,
    },
    sub_district: {
      required: true,
      type: String,
    },
    postal_code: {
      required: true,
      type: String,
    },
    dob: {
      required: true,
      type: Date,
    },
    pob: {
      required: true,
      type: String,
    },
  },
  { _id: false }
);
const User = mongoose.model("users", userSchema);
module.exports = User;
