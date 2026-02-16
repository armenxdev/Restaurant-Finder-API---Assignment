import Joi from 'joi';

export const createRestaurantSchema = {
    body: Joi.object({
        name: Joi.string().min(3).max(255).required(),
        description: Joi.string().optional(),
        cuisineType: Joi.string().max(100).optional(),
        address: Joi.string().required(),
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required(),
        rating: Joi.number().min(0).max(5).optional(),
        priceRange: Joi.string().valid('$', '$$', '$$$', '$$$$').optional(),
        phone: Joi.string().max(20).optional(),
        isOpen: Joi.boolean().optional(),
    })
};

export const updateRestaurantSchema = {
    body: Joi.object({
        name: Joi.string().min(3).max(255).optional(),
        description: Joi.string().optional(),
        cuisineType: Joi.string().max(100).optional(),
        address: Joi.string().optional(),
        latitude: Joi.number().min(-90).max(90).optional(),
        longitude: Joi.number().min(-180).max(180).optional(),
        rating: Joi.number().min(0).max(5).optional(),
        priceRange: Joi.string().valid('$', '$$', '$$$', '$$$$').optional(),
        phone: Joi.string().max(20).optional(),
        isOpen: Joi.boolean().optional(),
    })
};

export const nearbyQuerySchema = {
    query: Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required(),
        radius: Joi.number().min(1).max(50000).default(5000).optional(),
        limit: Joi.number().integer().min(1).max(100).default(10).optional(),
        cuisineType: Joi.string().optional(),
        minRating: Joi.number().min(0).max(5).optional(),
    })
};

export const getAllQuerySchema = {
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1).optional(),
        limit: Joi.number().integer().min(1).max(100).default(10).optional(),
        cuisineType: Joi.string().optional(),
        priceRange: Joi.string().valid('$', '$$', '$$$', '$$$$').optional(),
    })
};

export const restaurantByIdSchema = {
    params: Joi.object({
        id: Joi.string().required(),
    })
}