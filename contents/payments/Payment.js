const { responseAPI } = require("../../helpers/common");
const { createVirtualAccount, createOutlet } = require("./Xendit");

const moment = require("moment"); // require
const Meta = require("../../models/others/meta");
const User = require("../../models/users/users");
const {
  Payment,
  StatusPayment,
  PaymentMethod,
} = require("../../models/payments/payment");
const { v4 } = require("uuid");

const createPayment = async (order, data) => {
  const now = moment().format("YYYY-MM-DD");

  let ammount = 0;

  for (const item of data.items) {
    ammount += item.harga;
  }

  const payment = new Payment({
    _id: "P-" + now + "-" + v4(),
    order_id: order._id,
    payment_method: data.payment_method,
    payment_type: data.payment_type,
    ammount: ammount,
  });

  const result = await payment
    .save()
    .then((res) => {
      return responseAPI(res, true, 200, "Data successfully created");
    })
    .catch((err) => {
      return responseAPI(err, false, err.code, err.message, "MONGO");
    });

  if (!result.status) {
    return result;
  }

  let paymentMethod = data.payment_method;
  let paymentXendit = null;
  switch (paymentMethod) {
    case PaymentMethod.PAYMENT_E_WALLET:
      console.log(`Not implemented yet`);
      break;
    case PaymentMethod.PAYMENT_VIRTUAL_ACCOUNT:
      paymentXendit = await prosesVirtualAccount(result.data, order);
      break;
    case PaymentMethod.PAYMENT_OUTLET:
      paymentXendit = await prosesOutlet(result.data, order);
      break;
    default:
      break;
  }

  return paymentXendit;
};

const updateVirtualAccountPayment = async (data) => {
  let updatedData = {
    status: data.status,
  };

  if (data.status === StatusPayment.STATUS_ACTIVE) {
    updatedData.expired_date = moment(data.expiration_date);
    updatedData.xendit_id = data.id;
  } else if (data.status === StatusPayment.STATUS_COMPLETE) {
    updatedData.payment_id = data.payment_id;
    updatedData.paid_date = moment(data.transaction_timestamp);
  }

  const payment = await Payment.findOneAndUpdate(
    { _id: data.external_id },
    updatedData,
    {
      returnOriginal: false,
    }
  )
    .then((result) =>
      responseAPI(result, true, 200, "Payment Successfully Updated.")
    )
    .catch((err) =>
      responseAPI(err, false, err.code, "Payment Failed Updated.", "MONGO")
    );

  return payment;
};

const createInvoice = async (data) => {};

const prosesVirtualAccount = async (payment, data) => {
  const virtualAccountNumber = await Meta.findOne({
    model_type: "users",
    model_id: data.user_id,
    meta_key: "payment_1",
  })
    .populate("model_type")
    .exec()
    .then((meta) => {
      return responseAPI(meta.meta_value, true, 200, "");
    })
    .catch((err) => {
      return responseAPI(err, false, err.code, "", "MONGO");
    });

  if (!virtualAccountNumber.status) {
    // TODO: Need to be implement to handle error when VA does not exists
    return;
  }

  const VAObject = {
    externalID: payment._id,
    bankCode: payment.payment_type,
    name: `Caretaker Customer`,
    virtualAccNumber: virtualAccountNumber.data,
    isClosed: true,
    expectedAmt: payment.ammount,
    isSingleUse: true,
    expirationDate: moment().add(1, "days"),
  };

  const VAResult = await createVirtualAccount(VAObject);

  if (!VAResult.status) {
    return VAResult;
  }

  return responseAPI(
    {
      payment_number: VAResult.data.account_number,
      payment_method: payment.payment_type,
      external_id: payment._id,
    },
    true,
    200,
    "Data successfully created"
  );
};

const prosesOutlet = async (payment, data) => {
  const outletValue = await Meta.findOne({
    model_type: "users",
    model_id: data.user_id,
    meta_key: "payment_2",
  })
    .populate("model_type")
    .exec()
    .then((meta) => {
      return responseAPI(meta.meta_value, true, 200, "");
    })
    .catch((err) => {
      return responseAPI(err, false, err.code, "", "MONGO");
    });

  if (!outletValue.status) {
    // TODO: Need to be implement to handle error when VA does not exists
    return;
  }

  const OutletObject = {
    externalID: payment._id,
    retailOutletName: payment.payment_type.toUpperCase(),
    name: `Caretaker Customer`,
    paymentCode: outletValue.data,
    expectedAmt: payment.ammount,
    isSingleUse: true,
    expirationDate: moment().add(1, "days"),
  };

  const retailResult = await createOutlet(OutletObject);

  if (!retailResult.status) {
    return retailResult;
  }

  return responseAPI(
    {
      payment_number: retailResult.data.payment_code,
      payment_method: payment.payment_type,
      external_id: payment._id,
    },
    true,
    200,
    "Data successfully created"
  );
};

module.exports = {
  createPayment,
  createInvoice,
  updateVirtualAccountPayment,
};
