import { Router } from "express";
import validation from "../middlewares/validation.js";
import controller from "../controllers/Restaurants.js";
import { restaurantSchemas } from "../validators/index.js";

const restaurantRouter = Router();

restaurantRouter.get(
    "/",
    validation(restaurantSchemas.getAll, "query"),
    controller.getAllRestaurants
);

restaurantRouter.get(
    "/:id",
    validation(restaurantSchemas.byIdSchema, "params"),
    controller.getRestaurantById
);

restaurantRouter.post(
    "/",
    validation(restaurantSchemas.create, "body"),
    controller.createRestaurant
);

restaurantRouter.put(
    "/:id",
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
