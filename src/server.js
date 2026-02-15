import express from 'express';
import 'dotenv/config.js';
import sequelize from './client/db.sequelize.js'
import cookieParser from "cookie-parser";
import routes from './routes/index.js';
import { seedRestaurants } from './seeders/seedRestaurants.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import productsRouter from "./routes/productRoutes.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/restaurants', routes.restaurantRouter);
app.use('/api/restaurants', routes.productsRouter);
app.use('/api/users', routes.usersRouter);
app.use(errorMiddleware);

const port = process.env.PORT || 3000;

async function initDatabase() {
    try {
        console.log('Connecting to DB...');
        await sequelize.authenticate();
        console.log('✅ Database connected');

        console.log('Syncing tables...');
        await sequelize.sync({ alter: true });
        console.log('✅ All tables synced');

        // console.log('Seeding restaurants...');
        // await seedRestaurants();
        // console.log('✅ Database seeded');

    } catch (err) {
        console.error('❌ Database init failed:', err);
        process.exit(1);
    }
}

(async () => {
    await initDatabase();
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
})();
