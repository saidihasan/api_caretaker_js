const User = require("../../models/users/users");

const { responseAPI, generateRandomNumber } = require("../../helpers/common");

const { v4 } = require("uuid");
const Meta = require("../../models/others/meta");
const { PaymentMethod } = require("../../models/payments/payment");

const getAllUser = async () => {
  return await User.find({})
    .then((users) => {
      return responseAPI(users, true, 200, "");
    })
    .catch((err) => {
      return responseAPI(err, false, err.code, "MONGO");
    });
};

const getById = async (id) => {
  return await User.findById(id)
    .then((user) => responseAPI(user, true, 200, ""))
    .catch((err) => responseAPI(err, false, err.code, "MONGO"));
};

const createUser = async (data) => {
  const user = new User({
    ...data,
    _id: data.user_id,
    dob: new Date(data.dob),
  });

  const userResult = await user
    .save()
    .then((user) => {
      return responseAPI(user, true, 200, null);
    })
    .catch((err) => {
      return responseAPI(err, false, err.code, err.message, "MONGO");
    });

  if (!userResult.status) {
    return userResult;
  }

  let result = await createPaymentMethodUser(userResult.data);

  if (!result.status) {
    return result;
  }

  return userResult;
};

const createPaymentMethodUser = async (user) => {
  let paymentMethodMeta = [];
  let account_value = null;
  let metaResult = null;

  for (let method = 0; method <= 2; method++) {
    let meta_key = `payment_${method}`;

    if (method === PaymentMethod.PAYMENT_E_WALLET) {
      continue;
    } else if (method === PaymentMethod.PAYMENT_VIRTUAL_ACCOUNT) {
      account_value = generateRandomNumber(9999999999, 9999000001);
    } else if (method === PaymentMethod.PAYMENT_OUTLET) {
      account_value = generateRandomNumber(1, 99999);
    }

    metaResult = await Meta.findOne({
      meta_key: meta_key,
      meta_value: account_value,
    })
      .then((result) => {
        return responseAPI(result, true, 200, "");
      })
      .catch((err) => {
        return responseAPI(err, false, err.code, "", "MONGO");
      });

    if (!metaResult.status) {
      return metaResult;
    }

    if (metaResult.data !== null) {
      method--;
    }

    paymentMethodMeta.push({
      _id: v4(),
      model_type: "users",
      model_id: user._id,
      meta_key: meta_key,
      meta_value: account_value,
    });
  }

  let result = await Meta.insertMany(paymentMethodMeta)
    .then((res) => {
      return responseAPI(res, true, 200, "Data successfully created");
    })
    .catch((err) => {
      return responseAPI(err, false, err.code, err.message, "MONGO");
    });

  return result;
};

module.exports = {
  getAllUser,
  getById,
  createUser,
};
