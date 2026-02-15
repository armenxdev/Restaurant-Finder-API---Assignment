import { DataTypes, Model } from 'sequelize';
import sequelize from "../client/db.sequelize.js";

class Restaurant extends Model {}

Restaurant.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: { len: [3, 255] }
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        cuisineType: {
            type: DataTypes.STRING(100),
            allowNull: true
        },

        address: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: false,
            validate: { min: -90, max: 90 }
        },

        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: false,
            validate: { min: -180, max: 180 }
        },

        location: {
            type: DataTypes.GEOMETRY('POINT', 4326),
            allowNull: false
        },

        rating: {
            type: DataTypes.DECIMAL(2, 1),
            defaultValue: 0,
            validate: { min: 0, max: 5 }
        },

        priceRange: {
            type: DataTypes.ENUM('$', '$$', '$$$', '$$$$'),
            defaultValue: '$$'
        },

        phone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },

        isOpen: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        sequelize,
        modelName: 'Restaurant',
        tableName: 'restaurants',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['latitude', 'longitude'] },
            { type: 'SPATIAL', fields: ['location'] }
        ]
    }
);

Restaurant.beforeValidate((restaurant, options) => {
    const lat = parseFloat(restaurant.latitude);
    const lng = parseFloat(restaurant.longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
        restaurant.location = { type: 'Point', coordinates: [lng, lat] };
    }
});



export default Restaurant;
