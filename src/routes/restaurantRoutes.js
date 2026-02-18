import { Router } from "express";
import validation from "../middlewares/validation.js";
import controller from "../controllers/Restaurants.js";
import { restaurantSchemas } from "../validators/index.js";
import {uploadRestaurantImage} from "../middlewares/upload.js";

const restaurantRouter = Router();

restaurantRouter.get(
    "/",
    validation(restaurantSchemas.getAll, "query"),
    controller.getAllRestaurants
);

restaurantRouter.put(
    "/:id/cover",
    uploadRestaurantImage,
    controller.updateCoverImage
);

restaurantRouter.get(
    "/nearby",
    validation(restaurantSchemas.nearby, "query"),
    controller.getNearbyRestaurants
);

restaurantRouter.get(
    "/:id",
    validation(restaurantSchemas.byIdSchema, "params"),
    controller.getRestaurantById
);

restaurantRouter.post(
    "/",
    uploadRestaurantImage,
    validation(restaurantSchemas.create, "body"),
    controller.createRestaurant
);

restaurantRouter.put(
    "/:id",
    uploadRestaurantImage,
    validation(restaurantSchemas.byIdSchema, "params"),
    validation(restaurantSchemas.update, "body"),
    controller.updateRestaurant
);

restaurantRouter.delete(
    "/:id",
    validation(restaurantSchemas.byIdSchema, "params"),
    controller.deleteRestaurant
);

export default restaurantRouter;
