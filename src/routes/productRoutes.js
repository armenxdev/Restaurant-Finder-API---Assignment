import { Router } from "express";
import validation from "../middlewares/validation.js";
import controller from "../controllers/Products.js";
import {productSchemas} from "../validators/index.js";


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

productsRouter.post(
    "/:restaurantId/products",
    validation(productSchemas.RestaurantIdOnly, "params"),
    validation(productSchemas.create, "body"),
    controller.createProduct
);

productsRouter.put(
    "/:restaurantId/products/:productId",
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