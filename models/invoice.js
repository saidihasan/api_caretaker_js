const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invoiceSchema = new Schema({
    paymentId: {
        type: String
    },
    userId: {
        required: true,
        type: String
    },
    durationService: {
        required: true,
        type: String
    },
    paymentDate: {
        required: true,
        type: String
    },
    perawatId: {
        required: true,
        type: String
    },
    paymentStatus: {
        required: true,
        type: String
    },
    activeService: {
        type: Boolean
    }
})
const Invoice = mongoose.model('invoice', invoiceSchema);
module.exports = Invoice;