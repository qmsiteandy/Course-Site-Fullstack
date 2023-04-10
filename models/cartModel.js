const mongoose = require(mongoose);

const cartSchema = new mongoose.Schema({
  userId: { type: Number },
  cartList: { type: Array },
});

module.exports = mongoose.model("Cart", cartSchema);
