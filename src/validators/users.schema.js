import Joi from "joi";

export const createUserSchema = {
    body: Joi.object({
        username: Joi.string().min(3).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(255).required(),
    })
}

export const loginSchema = {
    email: Joi.string().email().required(),
    password: Joi.string().required(),
}