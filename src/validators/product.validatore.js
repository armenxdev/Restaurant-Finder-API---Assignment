import Joi from 'joi';

export const createProductSchema = {
    body: Joi.object({
        name: Joi.string().min(2).max(255).required(),
        description: Joi.string().optional(),
        price: Joi.number().min(0).required(),
        category: Joi.string().max(100).optional(),
        isAvailable: Joi.boolean().optional(),
    })
}

export const updateProductSchema = Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    description: Joi.string().optional(),
    price: Joi.number().min(0).optional(),
    category: Joi.string().max(100).optional(),
    isAvailable: Joi.boolean().optional(),
});

export const validateRestaurantAndProductId = {
    params: Joi.object({
        restaurantId: Joi.number().integer().positive().required(),
        productId: Joi.number().integer().positive().required()
    })
};

export const validateRestaurantIdOnly = {
    params: Joi.object({
        restaurantId: Joi.number().integer().positive().required()
    })
};
