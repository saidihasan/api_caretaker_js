const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const metaSchema = new Schema(
  {
    _id: {
      required: true,
      type: String,
    },
    model_id: {
      required: true,
      type: String,
      refPath: "model_type",
    },
    model_type: {
      required: true,
      type: String,
    },
    meta_key: {
      required: true,
      type: String,
    },
    meta_value: {
      required: true,
      type: String,
    },
  },
  { _id: false }
);

const Meta = mongoose.model("model_has_meta", metaSchema);
module.exports = Meta;
