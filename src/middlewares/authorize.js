import jwt from "jsonwebtoken";
import HttpErrors from "http-errors";
import Users from '../models/users.js';

import 'dotenv/config'
const JWT_SECRET = process.env.JWT_SECRET;

export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers?.authorization;

  if (!authHeader) {
    return next(new HttpErrors(401, 'No token provided'));
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== "Bearer" || !token) {
    return next(new HttpErrors(401, 'Unauthorized'));
  }

  let user = null;

  try {
    const data = jwt.verify(token, JWT_SECRET);
    console.log(data);
    user = await Users.findByPk(data.id);
  } catch (err) {
    return next(new HttpErrors(401, 'Invalid token'));
  }


  if (!user) {
    return next(new HttpErrors(401, 'User not found'));
  }

  req.userId = user.id;
  next();
}
