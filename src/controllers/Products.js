import Product from "../models/Products.js";
import Restaurant from "../models/Restaurant.js";

export default {
    createProduct: async (req, res, next) => {
        try {
            const restaurantId = req.params.restaurantId;
            const existRestaurant = await Restaurant.findByPk(restaurantId);

            console.log(existRestaurant);
            if (!existRestaurant) {
                return res.status(404).json({
                    success: false,
                    error: 'Restaurant not found'
                })
            }

             const product = await Product.create({
                 ...req.body,
                 restaurantId
             });

            res.status(201).send({
                success: true,
                message: "Product created successfully",
                product
            });
        }catch (err){
            next(err)
        }
    },

    getProductsByRestaurantId: async (req, res, next) => {
        const restaurantId = req.params.restaurantId;

        const existRestaurant = await Restaurant.findByPk(restaurantId);
        if (!existRestaurant) {
            return res.status(404).json({
                success: false,
                error: 'Restaurant not found'
            })
        }

        const products = await Product.findAll({
            where: {
                restaurantId
            },
            order: [['created_at', 'DESC']]
        });


        return res.status(200).json({
            success: true,
            count: products.length,
            data: products
        })
    },

    getProductById: async (req, res) => {
        const { restaurantId, productId } = req.params;

        const product = await Product.findOne({
            where: {
                id: productId,
                restaurantId
            }
        });

        if(!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            })
        }

        res.status(200).json({
            success: true,
            data: product
        })
    },

    updateProduct: async (req, res) => {
      const { restaurantId, productId } = req.params;

        const product = await Product.findOne({
            where: {
                id: productId,
                restaurantId
            }
        });

        if(!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            })
        }

        await product.update( req.body )

        res.status(200).json({
            success: true,
            data: product
        })
    },

    removeProduct: async (req, res, next) => {
        const { restaurantId, productId } = req.params;

        const product = await Product.findOne({
            where: {
                id: productId,
                restaurantId
            }
        });

        if(!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            })
        }

        await product.destroy()

        res.status(200).json({
            success: true,
            message: "Product removed successfully",
        })
    }
}