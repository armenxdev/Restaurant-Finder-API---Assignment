import { Router } from 'express';
import validation from "../middlewares/validation.js";
import controller from "../controllers/Users.js";
import authorize from "../middlewares/authorize.js";
import {usersSchemas} from "../validators/index.js";

const usersRoutes = new Router();

usersRoutes.post(
    '/register',
    validation(usersSchemas.create, "body"),
    controller.register
)

usersRoutes.post(
    '/login',
    validation(usersSchemas.login, "body"),
    controller.login
)

usersRoutes.get(
    '/profile',
    authorize,
    controller.profile
)

export default usersRoutes;
