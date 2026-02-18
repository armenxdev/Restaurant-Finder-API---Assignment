import { DataTypes, Model } from "sequelize";
import sequelize from "../client/db.sequelize.js";


class Product extends Model {}

Product.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },


        restaurantId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'restaurants',
                key: 'id'
            }
        },

        images: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null
        },


        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                len: [2, 255]
            }
        },

        description: { type: DataTypes.TEXT,
            allowNull: true
        },

        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        },

        category: {
            type: DataTypes.STRING(100),
            allowNull: true
        },

        isAvailable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    },
    {
        sequelize,
        modelName: "Product",
        tableName: "products",
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);



export default Product;
