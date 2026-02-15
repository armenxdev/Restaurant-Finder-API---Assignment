import Product from './Products.js';
import Restaurant from './Restaurant.js';

Restaurant.hasMany(Product, { foreignKey: 'restaurantId', as: 'products' });
Product.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
