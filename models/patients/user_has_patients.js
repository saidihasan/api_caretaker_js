const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userHasPatientSchema = new Schema({
  patientId: {
    required: true,
    type: String,
  },
  userId: {
    required: true,
    type: String,
  },
  relation: {
    required: true,
    type: String,
  },
});
const UserHasPatient = mongoose.model(
  "user_has_patients",
  userHasPatientSchema
);
module.exports = UserHasPatient;
