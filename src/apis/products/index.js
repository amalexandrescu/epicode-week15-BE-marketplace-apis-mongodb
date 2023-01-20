import express from "express";
import ProductsModel from "./productsModel.js";
import createHttpError from "http-errors";
import CartsModel from "./cartsModel.js";
import q2m from "query-to-mongo";

const productsRouter = express.Router();

productsRouter.post("/", async (req, res, next) => {
  try {
    //in the req.body we will get the produst we want to create
    const newProduct = new ProductsModel(req.body);
    const { _id } = await newProduct.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/", async (req, res, next) => {
  try {
    console.log("queries: ", req.query);
    const mongoQuery = q2m(req.query);
    console.log("mongo queries: ", mongoQuery);

    // const blogs = await BlogsModel.find()
    // .sort(mongoQuery.options.sort)
    // .skip(mongoQuery.options.skip)
    // .limit(mongoQuery.options.limit);
    // res.send({
    //   links: mongoQuery.links("http:localhost:3001/blogPosts", total),
    //   totalPages: Math.ceil(total / mongoQuery.options.limit),
    //   blogs,
    // });
    const total = await ProductsModel.countDocuments(mongoQuery.criteria);
    console.log("total", total);
    const products = await ProductsModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    )
      .sort(mongoQuery.options.sort)
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip);
    // {
    //   $and: [
    //     { price: { $gte: 15 } },
    //     { price: { $lt: 20 } },
    //     { category: "toys" },
    //   ],
    // },
    // { name: 0, _id: 0 }
    // ();
    res.send({
      links: mongoQuery.links("http://localhost:3001/products", total),
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      products,
    });
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const product = await ProductsModel.findById(req.params.productId);
    if (product) {
      res.send(product);
    } else {
      next(
        createHttpError(`Product with id ${req.params.productId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.put("/:productId", async (req, res, next) => {
  try {
    const updatedProduct = await ProductsModel.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedProduct) {
      res.send(updatedProduct);
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.delete("/:productId", async (req, res, next) => {
  try {
    const deletedProduct = await ProductsModel.findByIdAndDelete(
      req.params.productId
    );
    if (deletedProduct) {
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// ********************** Embedding reviews into products ************************

productsRouter.post("/:productId/reviews", async (req, res, next) => {
  try {
    //in the req.params.id we have the id of the products
    //in the req.body we have the review we want to add

    const searchedProduct = await ProductsModel.findById(req.params.productId);

    if (searchedProduct) {
      const updatedProduct = await ProductsModel.findByIdAndUpdate(
        req.params.productId,
        {
          $push: {
            reviews: { ...req.body },
          },
        },
        { new: true, runValidators: true }
      );
      res.send(updatedProduct);
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:productId/reviews", async (req, res, next) => {
  try {
    const searchedProduct = await ProductsModel.findById(req.params.productId);

    if (searchedProduct) {
      res.send(searchedProduct.reviews);
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const searchedProduct = await ProductsModel.findById(req.params.productId);
    if (searchedProduct) {
      const searchedReview = searchedProduct.reviews.find(
        (review) => review._id.toString() === req.params.reviewId
      );
      if (searchedReview) {
        res.send(searchedReview);
      } else {
        next(
          createHttpError(
            404,
            `Review with id ${req.params.reviewId} not found`
          )
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.put("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const searchedProduct = await ProductsModel.findById(req.params.productId);
    if (searchedProduct) {
      const index = searchedProduct.reviews.findIndex(
        (review) => req.params.reviewId === review._id.toString()
      );

      if (index !== -1) {
        searchedProduct.reviews[index] = {
          ...searchedProduct.reviews[index].toObject(),
          ...req.body,
        };

        await searchedProduct.save();
        res.send(searchedProduct);
      } else {
        next(
          createHttpError(
            404,
            `Review with id ${req.params.reviewId} not found`
          )
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.delete(
  "/:productId/reviews/:reviewId",
  async (req, res, next) => {
    try {
      const updatedProduct = await ProductsModel.findByIdAndUpdate(
        req.params.productId,
        { $pull: { reviews: { _id: req.params.reviewId } } },
        { new: true }
      );
      if (updatedProduct) {
        res.send(updatedProduct);
      } else {
        next(
          createHttpError(
            404,
            `Product with id ${req.params.productId} not found`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

productsRouter.post("/cart", async (req, res, next) => {
  try {
    //in the req.body we will get the produst we want to create
    const newCart = new CartsModel(req.body);
    const { _id } = await newCart.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

productsRouter.post("/:cartId", async (req, res, next) => {
  try {
    //in req.body we will receive productId and the quantity

    const { productId, quantity } = req.body;

    const cart = CartsModel.findById(req.params.cartId);

    if (!cart) {
      return next(
        createHttpError(404, `Cart with id ${req.params.cartId} not found`)
      );
    }

    const product = await ProductsModel.findById(productId);

    if (!product) {
      return next(
        createHttpError(404, `Product with id ${productId} not found`)
      );
    }

    // const index = cart.products.findIndex(
    //   (product) => product.productId.toString() === productId
    // );

    const isProductThere = await CartsModel.findOne({
      _id: req.params.cartId,
      "products.productId": productId,
    });

    // if (index !== -1)
    if (isProductThere) {
      // cart.products[index].quantity += quantity;

      const updatedCart = await CartsModel.findOneAndUpdate(
        {
          _id: req.params.cartId,
          "products.productId": productId,
        }, // WHAT
        { $inc: { "products.$.quantity": quantity } }, // HOW
        { new: true, runValidators: true } // OPTIONS
      );

      res.send(updatedCart);
    } else {
      const modifiedCart = await CartsModel.findOneAndUpdate(
        req.body.cartId, // WHAT
        { $push: { products: { productId: productId, quantity } } }, // HOW
        { new: true, runValidators: true, upsert: true } // OPTIONS, upsert:true means if the product is NOT found --> Mongo please create that automagically (also with the productId and quantity in it)
      );
      res.send(modifiedCart);
    }
  } catch (error) {
    next(error);
  }
});

export default productsRouter;
