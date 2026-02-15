import Restaurant from "../models/Restaurant.js";

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

            const existingRestaurant = await Restaurant.findByPk({
                where: {
                    id: id
                }
            })

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

        const existingRestaurant = await Restaurant.findByPk({
            where: {
                id: id
            }
        })

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

    updateRestaurant: async (req, res) => {
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
