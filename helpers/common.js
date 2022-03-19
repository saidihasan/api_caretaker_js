const { v4 } = require("uuid");
const STATUS_CODE = require("./status_code");

const generateExternalId = (prefix = null) => {
  const externalId = v4();
};

const responseAPI = (data, status, code, message, type = "DEFAULT") => {
  const response = {
    message: message,
    code: STATUS_CODE[type][code],
    status: status,
    data: !status ? [] : data,
  };
  return response;
};

const generateRandomNumber = (max, min) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = {
  generateExternalId,
  responseAPI,
  generateRandomNumber,
};
