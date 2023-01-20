import mongoose from "mongoose";

const { Schema, model } = mongoose;

const cartsSchema = new Schema(
  {
    products: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default model("Cart", cartsSchema);
