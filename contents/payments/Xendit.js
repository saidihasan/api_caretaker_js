const Xendit = require("xendit-node");
const { responseAPI } = require("../../helpers/common");
const moment = require("moment");

const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY,
});

const createInvoice = async (request) => {
  const { Invoice } = xendit;
  const invoiceSpecificOptions = {};
  const invoice = new Invoice(invoiceSpecificOptions);

  const resp = await invoice
    .createInvoice({
      externalID: externalId,
      amount: request.body.total_harga,
      payerEmail: request.body.email,
      description: request.body.description,
      shouldSendEmail: true,
      customer: {
        given_names: request.body.username,
        email: request.body.email,
      },
      paymentMethods: request.body.payment_method,
      customerNotificationPreference: {
        invoice_created: ["email"],
      },
    })
    .catch((error) => {
      return error;
    });

  return resp;
};

const createVirtualAccount = async (data) => {
  const { VirtualAcc } = xendit;
  const vaSpecificOptions = {};
  const va = new VirtualAcc(vaSpecificOptions);

  let result = await va
    .createFixedVA(data)
    .then((result) => {
      return responseAPI(result, true, 200, "Xendit VA successfully created");
    })
    .catch((err) => {
      console.log(err);
      return responseAPI(
        err,
        false,
        err.code,
        "Failed to create VA from Xendit",
        "XENDIT"
      );
    });

  return result;
};

const createOutlet = async (data) => {
  const { RetailOutlet } = xendit;
  const outletSpecificOptions = {};
  const outlet = new RetailOutlet(outletSpecificOptions);

  let result = await outlet
    .createFixedPaymentCode(data)
    .then((result) => {
      return responseAPI(result, true, 200, "Xendit VA successfully created");
    })
    .catch((err) => {
      console.log(err);
      return responseAPI(
        err,
        false,
        err.code,
        "Failed to create Payment Outlet from Xendit",
        "XENDIT"
      );
    });

  return result;
};

module.exports = {
  createInvoice,
  createVirtualAccount,
  createOutlet,
};
