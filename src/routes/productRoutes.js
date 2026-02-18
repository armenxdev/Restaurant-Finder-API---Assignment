import { Router } from "express";
import validation from "../middlewares/validation.js";
import controller from "../controllers/Products.js";
import {productSchemas} from "../validators/index.js";
import authorize from "../middlewares/authorize.js";

import {uploadProductImages} from "../middlewares/upload.js";


const productsRouter = Router({ mergeParams: true });

productsRouter.get(
    "/:restaurantId/products",
    validation(productSchemas.RestaurantIdOnly, "params"),
    controller.getProductsByRestaurantId
);

productsRouter.get(
    "/:restaurantId/products/:productId",
    validation(productSchemas.RestaurantAndProductId, "params"),
    controller.getProductById
);

productsRouter.put(
    "/:productId",
    authorize,
    uploadProductImages,
    controller.addProductImages
);

productsRouter.post(
    "/:restaurantId/products",
    authorize,
    uploadProductImages,
    validation(productSchemas.RestaurantIdOnly, "params"),
    validation(productSchemas.create, "body"),
    controller.createProduct
);

productsRouter.put(
    "/:restaurantId/products/:productId",
    authorize,
    uploadProductImages,
    validation(productSchemas.RestaurantAndProductId, "params"),
    validation(productSchemas.update, "body"),
    controller.updateProduct
);

productsRouter.delete(
    "/:restaurantId/products/:productId",
    validation(productSchemas.RestaurantAndProductId, "params"),
    controller.removeProduct
);

export default productsRouter;