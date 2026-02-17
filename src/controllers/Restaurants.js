import Restaurant from "../models/Restaurant.js";
import sequelize from "../client/db.sequelize.js";
import {QueryTypes} from "sequelize";

export default {
    createRestaurant: async (req, res, next) => {
        try {
            const restaurant = await Restaurant.create(req.body);

            const data = restaurant.toJSON();
            delete data.location;

            res.status(201).json({
                status: true,
                message: 'Restaurant created successfully',
                data
            });

        } catch (err) {
            next(err);
        }
    },

    getAllRestaurants: async (req, res, next) => {
        console.log("Started controller")

        try {
            const { page = 1, limit = 10, cuisineType, priceRange } = req.query;

            const offset = (page - 1) * limit;

            const where = {};
            if (cuisineType) where.cuisineType = cuisineType;
            if (priceRange) where.priceRange = priceRange;

            const restaurants = await Restaurant.findAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['created_at', 'DESC']],
            });

            res.status(200).json({
                status: true,
                page: parseInt(page),
                limit: parseInt(limit),
                count: restaurants.length,
                data: restaurants
            });

        } catch (err) {
            next(err);
        }
    },

    getRestaurantById: async (req, res, next) => {
        try {
            const id = req.params.id;

            const existingRestaurant = await Restaurant.findByPk(id)

            if(!existingRestaurant){
                return res.status(404).json({
                    status: false,
                    message: 'No restaurant found'
                })
            }

            res.status(200).json({
                status: true,
                data: existingRestaurant
            })
        }catch (err) {
            next(err);
        }
    },

    deleteRestaurant: async (req, res, next) => {
        const id = req.params.id;

        const existingRestaurant = await Restaurant.findByPk(id);

        if(!existingRestaurant){
            return res.status(404).json({
                status: false,
                message: 'No restaurant found'
            })
        }

        await Restaurant.destroy({
            where: {
                id: id
            }
        })

        res.status(200).json({
            status: true,
            message: 'Restaurant Deleted Successfully'
        })
    },

    getNearbyRestaurants: async (req, res, next) => {
        try {

            let { latitude, longitude, radius, limit, cuisineType, minRating } = req.query;

            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            const rad = parseInt(radius) || 1000;
            const lim = parseInt(limit) || 20;

            let whereClauses = [`is_open = true`];
            let replacements = { lat, lng, rad, lim };

            whereClauses.push(`ST_Distance_Sphere(location, POINT(:lng, :lat)) <= :rad`);

            if (cuisineType) {
                whereClauses.push(`cuisine_type = :cuisineType`);
                replacements.cuisineType = cuisineType;
            }

            if (minRating) {
                whereClauses.push(`rating >= :minRating`);
                replacements.minRating = parseFloat(minRating);
            }

            const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

            const query = `
            SELECT
                
                id, name, description, cuisine_type AS cuisineType, address, latitude, longitude, rating, price_range AS priceRange, phone,
                ST_Distance_Sphere(location, POINT(:lng, :lat)) AS distanceMetres
            FROM restaurants
            ${whereSQL}
            ORDER BY distanceMetres ASC
            LIMIT :lim;
        `;

            console.log("=== Raw SQL Query ===");
            console.log(query);

            const data = await sequelize.query(query, {
                type: QueryTypes.SELECT,
                replacements
            });

            console.log("=== Data fetched ===");
            console.log(data);

            res.status(200).json({
                success: true,
                count: data.length,
                searchLocation: { latitude: lat, longitude: lng },
                radiusMetres: rad,
                data
            });

        } catch (e) {
            next(e);
        }
    },

    updateRestaurant: async (req, res) => {
        console.log("Started controller")

        const id = req.params.id;

        const existingRestaurant = await Restaurant.findByPk(id)

        await existingRestaurant.update(req.body);

        const data = existingRestaurant.toJSON();
        delete data.location;

        res.status(200).json({
            status: true,
            message: 'Restaurant updated successfully',
            data
        });
    }
};
