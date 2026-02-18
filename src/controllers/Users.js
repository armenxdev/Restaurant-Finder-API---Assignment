import User from '../models/Users.js';
import  jwt from 'jsonwebtoken';
import {Op} from "sequelize";
import 'dotenv/config'
import fs from "fs/promises";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const JWT_SECRET = process.env.JWT_SECRET;


export default {
    register: async (req, res, next) => {
        try {
            const { email, username, password } = req.body;

            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [{ username }, { email }]
                }
            });

            if (existingUser) {
                let message = '';
                if (existingUser.username === username) message = 'This username is already taken';
                else if (existingUser.email === email) message = 'This email is already taken';

                return res.status(401).json({
                    success: false,
                    message
                });
            }

            const user = await User.create({ username, email, password });

            const { password: _, ...userData } = user.toJSON();

            return res.status(201).json({
                success: true,
                user: userData
            });
        }catch (error) {
            next(error);
        }
    },

    updateProfilePicture: async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: "No file uploaded",
                });
            }

            const user = await User.findByPk(req.userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: "User not found",
                });
            }

            if (user.profilePicture) {
                try {
                    fs.unlinkSync(user.profilePicture);
                } catch (e) {
                    console.warn("Could not delete old picture:", e.message);
                }
            }

            user.profilePicture = req.file.path;
            await user.save();

            return res.status(200).json({
                success: true,
                message: "Profile picture updated",
                data: {
                    profilePicture: user.profilePicture,
                },
            });
        } catch (error) {
            next(error);
        }
    },

    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;

            const existingUser = await User.findOne({
                where: {
                    email: email
                }
            })

            if(!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User does not exist'
                })
            }

            const token = jwt.sign(
                {id: existingUser.id},
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            )

            const comparePassword = await existingUser.comparePassword(password);

            if (!comparePassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid Password'
                })
            }

            res.status(200).json({
                success: true,
                token: token,
                user: {
                    email: existingUser.email,
                    username: existingUser.username
                }
            })
        }catch (error) {
            next(error);
        }
    },

    profile: async (req, res, next) => {
        try {
            const userId = req.userId;

            const user = await User.findOne({
                where: {
                    id: userId
                }
            })

            res.status(200).json({
                success: true,
                user: {
                    id: userId,
                    username: user.username,
                    email: user.email
                }
            })
        }catch (error) {
            next(error);
        }
    }
}