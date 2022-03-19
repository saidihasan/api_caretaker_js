const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const patientSchema = new Schema({
  id: {
    required: true,
    type: String,
  },
  nik: {
    required: true,
    type: String,
  },
  name: {
    required: true,
    type: String,
  },
  gender: {
    required: true,
    type: Number,
  },
  address: {
    required: true,
    type: Sting,
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
  religion: {
    required: true,
    type: String,
  },
});
const Patient = mongoose.model("patients", patientSchema);
module.exports = Patient;
