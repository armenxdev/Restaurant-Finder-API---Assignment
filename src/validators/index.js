import {
    createProductSchema,
    updateProductSchema,
    validateRestaurantAndProductId,
    validateRestaurantIdOnly
} from "./product.validatore.js";

import {
    createRestaurantSchema,
    updateRestaurantSchema,
    nearbyQuerySchema,
    getAllQuerySchema,
    restaurantByIdSchema
} from "./restaurantvalidator.js";
import {createUserSchema, loginSchema} from "./users.schema.js";

export const productSchemas = {
    create: createProductSchema,
    update: updateProductSchema,
    RestaurantAndProductId: validateRestaurantAndProductId,
    RestaurantIdOnly: validateRestaurantIdOnly
}

export const restaurantSchemas = {
    create: createRestaurantSchema,
    update: updateRestaurantSchema,
    nearby: nearbyQuerySchema,
    getAll: getAllQuerySchema,
    byIdSchema: restaurantByIdSchema
}

export const usersSchemas = {
    create: createUserSchema,
    login: loginSchema,
}