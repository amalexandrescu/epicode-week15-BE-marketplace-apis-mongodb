import mongoose from "mongoose";

const { Schema, model } = mongoose;

const reviewsSchema = new Schema(
  {
    comment: { type: String, required: true },
    rate: { type: Number, required: true, min: 1, max: 5 },
    // min: [6, 'Must be at least 6, got {VALUE}'],
  },
  { timestamps: true }
);

const productsSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    brand: { type: String, required: true },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String },
    reviews: [reviewsSchema],
  },
  {
    timestamps: true,
  }
);

export default model("Product", productsSchema);

// {
//   "_id": "5d318e1a8541744830bef139", //SERVER GENERATED
//    "name": "app test 1",  //REQUIRED
//    "description": "somthing longer", //REQUIRED
//    "brand": "nokia", //REQUIRED
//    "imageUrl": "https://drop.ndtv.com/TECH/product_database/images/2152017124957PM_635_nokia_3310.jpeg?downsize=*:420&output-quality=80", //REQUIRED
//    "price": 100, //REQUIRED
//    "category": "smartphones",
//    "reviews": [.....]
//    "createdAt": "2019-07-19T09:32:10.535Z", //SERVER GENERATED
//    "updatedAt": "2019-07-19T09:32:10.535Z", //SERVER GENERATED
//    }
