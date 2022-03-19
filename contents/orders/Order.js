const { Order, OrderStatus } = require("../../models/orders/orders");
const OrderDetail = require("../../models/orders/order_details");

const moment = require("moment"); // require
const { responseAPI } = require("../../helpers/common");
const { v4 } = require("uuid");
const Payment = require("../../models/payments/payment");

const createOrder = async (data) => {
  const prefix = generatePrefixOrder();
  const suffix = await getSuffixOrder(prefix);

  if (!suffix.status) {
    return suffix;
  }

  const dataOrder = {
    _id: v4(),
    prefix: prefix,
    suffix: suffix.data.suffix,
    user_id: data.user_id,
    patient_id: data.patient_id,
    category_patient: data.category_patient,
  };

  const order = new Order(dataOrder);

  const result = await order
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

  let dataDetail = [];
  let ammount = 0;

  for (const item of data.items) {
    dataDetail.push({
      _id: v4(),
      order_id: result.data._id,
      perawat_id: item.perawat,
      start_date: item.tanggal_mulai,
      durasi: item.durasi,
      cuti: item.cuti,
      harga: item.harga,
    });
  }

  const orderDetail = await OrderDetail.insertMany(dataDetail)
    .then((res) => {
      return responseAPI(res, true, 200, "Data successfully created");
    })
    .catch((err) => {
      return responseAPI(err, false, err.code, err.message, "MONGO");
    });

  if (!orderDetail.status) {
    return orderDetail;
  }

  return result;
};

const updateStatusOrder = async (order_id, status) => {
  const order = await Order.findOneAndUpdate(
    { _id: order_id },
    {
      status: status,
    },
    {
      returnOriginal: false,
    }
  )
    .then((result) =>
      responseAPI(result, true, 200, "Order Successfully Updated.")
    )
    .catch((err) =>
      responseAPI(err, false, err.code, "Order Failed Updated.", "MONGO")
    );

  return order;
};

const generatePrefixOrder = () => {
  const now = moment().format("YYYY/MM/DD");
  return now;
};

const getSuffixOrder = (prefix) => {
  const orders = Order.find({ prefix: prefix })
    .select("suffix")
    .sort({ suffix: -1 })
    .limit(1)
    .then((doc) => {
      if (!doc[0]) {
        return responseAPI(
          { suffix: 1 },
          true,
          200,
          "Data successfully created"
        );
      }

      return responseAPI(doc[0], true, 200, "Data successfully created");
    })
    .catch((err) => {
      return responseAPI(err, false, err.code, err.message, "MONGO");
    });

  return orders;
};

module.exports = {
  createOrder,
  updateStatusOrder,
};
