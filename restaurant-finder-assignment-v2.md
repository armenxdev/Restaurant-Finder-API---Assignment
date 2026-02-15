# Restaurant Finder API - Assignment

## 📋 Overview
Build a fully working RESTful API that allows users to find restaurants nearest to their current location using Node.js, Express, Sequelize, Joi, and MySQL. The API includes JWT authentication, restaurant management, and a protected restaurant products system. You must implement every file from scratch using **Sequelize as the ORM** with the **ES6 class syntax**. Distance calculations must use **MySQL native geospatial functions** — no JavaScript math allowed.

## 🎯 Learning Objectives
- Define Sequelize models using the **ES6 class syntax** (`class XModel extends Model` + `XModel.init()`)
- Use **camelCase** for all model field names and let Sequelize map them to snake_case DB columns via `underscored: true`
- Implement JWT-based authentication (register, login, protected routes)
- Use MySQL native spatial data types (`POINT`, `GEOMETRY`) and spatial indexes
- Perform proximity queries with `ST_Distance_Sphere`
- Write raw Sequelize queries for geospatial operations
- Validate API requests with Joi
- Build RESTful endpoints with Express and protect routes with auth middleware

## 🛠️ Technology Stack
- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **ORM**: Sequelize v6
- **Database**: MySQL (v8.0+)
- **Validation**: Joi
- **Auth**: jsonwebtoken + bcryptjs
- **Environment**: dotenv

## 📦 Required Dependencies
- express
- sequelize
- mysql2
- joi
- dotenv
- jsonwebtoken
- bcryptjs
- nodemon (dev dependency)

---

## 🗄️ Database Schema

### Users Table
| Column | Type | Constraints |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `username` | VARCHAR(100) | NOT NULL, UNIQUE |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE |
| `password` | VARCHAR(255) | NOT NULL (hashed) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP |

### Restaurants Table
| Column | Type | Constraints |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `name` | VARCHAR(255) | NOT NULL |
| `description` | TEXT | |
| `cuisine_type` | VARCHAR(100) | |
| `address` | VARCHAR(255) | NOT NULL |
| `latitude` | DECIMAL(10,8) | NOT NULL |
| `longitude` | DECIMAL(11,8) | NOT NULL |
| `location` | POINT (SRID 4326) | NOT NULL — used for all spatial queries |
| `rating` | DECIMAL(2,1) | DEFAULT 0 |
| `price_range` | ENUM('$','$$','$$$','$$$$') | DEFAULT '$$' |
| `phone` | VARCHAR(20) | |
| `is_open` | BOOLEAN | DEFAULT true |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP |
| INDEX | (latitude, longitude) | For scalar filter fallback |
| **SPATIAL INDEX** | (location) | Required for `ST_*` query performance |

### Products Table
| Column | Type | Constraints |
|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT |
| `restaurant_id` | INT | FK → restaurants.id, NOT NULL |
| `name` | VARCHAR(255) | NOT NULL |
| `description` | TEXT | |
| `price` | DECIMAL(10,2) | NOT NULL |
| `category` | VARCHAR(100) | |
| `is_available` | BOOLEAN | DEFAULT true |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP |

### SQL Migration

```sql
CREATE TABLE users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  username     VARCHAR(100) NOT NULL UNIQUE,
  email        VARCHAR(255) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE restaurants (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  description  TEXT,
  cuisine_type VARCHAR(100),
  address      VARCHAR(255) NOT NULL,
  latitude     DECIMAL(10,8) NOT NULL,
  longitude    DECIMAL(11,8) NOT NULL,
  location     POINT NOT NULL SRID 4326,
  rating       DECIMAL(2,1) DEFAULT 0,
  price_range  ENUM('$','$$','$$$','$$$$') DEFAULT '$$',
  phone        VARCHAR(20),
  is_open      BOOLEAN DEFAULT true,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_lat_lng (latitude, longitude),
  SPATIAL INDEX idx_location (location)
);

CREATE TABLE products (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  price         DECIMAL(10,2) NOT NULL,
  category      VARCHAR(100),
  is_available  BOOLEAN DEFAULT true,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);
```

---

## 📝 Assignment Tasks

### Task 1: Project Setup (10 points)

1. Run `npm init -y` to initialize a new Node.js project
2. Install all required production dependencies: `express`, `sequelize`, `mysql2`, `joi`, `dotenv`, `jsonwebtoken`, `bcryptjs`
3. Install `nodemon` as a dev dependency
4. Create the following project structure — every file and folder must exist:
   ```
   project-root/
   ├── config/
   │   └── database.js
   ├── models/
   │   ├── User.js
   │   ├── Restaurant.js
   │   └── Product.js
   ├── controllers/
   │   ├── authController.js
   │   ├── restaurantController.js
   │   └── productController.js
   ├── routes/
   │   ├── authRoutes.js
   │   ├── restaurantRoutes.js
   │   └── productRoutes.js
   ├── validators/
   │   ├── authValidator.js
   │   ├── restaurantValidator.js
   │   └── productValidator.js
   ├── middleware/
   │   ├── authMiddleware.js
   │   └── errorHandler.js
   ├── seeders/
   │   └── seedRestaurants.js
   ├── .env
   ├── .gitignore
   ├── server.js
   └── package.json
   ```
5. In `package.json`, add a `start` script using `node server.js`, a `dev` script using `nodemon server.js`, and a `seed` script using `node seeders/seedRestaurants.js`
6. Create a `.gitignore` that ignores `node_modules/` and `.env`

---

### Task 2: Database Configuration (10 points)

**2.1 — Environment Variables**

Create a `.env` file in the project root with these variables:
- `DB_HOST` — MySQL server host (e.g. `localhost`)
- `DB_USER` — MySQL username
- `DB_PASSWORD` — MySQL password
- `DB_NAME` — database name (e.g. `restaurant_finder`)
- `DB_PORT` — MySQL port (default `3306`)
- `PORT` — Express server port (default `3000`)
- `JWT_SECRET` — a long random secret string used to sign JWT tokens (at least 32 characters)
- `JWT_EXPIRES_IN` — token expiry duration (e.g. `'7d'`)

**2.2 — Sequelize Instance (`config/database.js`)**

In `config/database.js`, you must:
- Import `Sequelize` from the `sequelize` package
- Import `dotenv` and call `dotenv.config()` at the top
- Create a new `Sequelize` instance using the five DB environment variables (`host`, `username`, `password`, `database`, `dialect`)
- Set `dialect` to `'mysql'`
- Set `logging` to `false`
- Configure a `pool` object: `max: 5`, `min: 0`, `acquire: 30000`, `idle: 10000`
- Export the Sequelize instance as the default export
- Export a `connectDB` async function that calls `sequelize.authenticate()` and logs success or failure

---

### Task 3: Create User Model (10 points)

In `models/User.js`, define the `User` model using the **ES6 class syntax** — declare `class User extends Model` and call `User.init()`. Using `sequelize.define()` is **not accepted**.

**3.1 — Fields (camelCase keys, `underscored: true` maps to snake_case in DB)**

> ⚠️ All field keys must be **camelCase** in the model definition. Sequelize maps them to snake_case column names automatically when `underscored: true` is set in the options.

| camelCase Field | DB Column | Sequelize Type | Constraints |
|---|---|---|---|
| `id` | `id` | `DataTypes.INTEGER` | primaryKey: true, autoIncrement: true |
| `username` | `username` | `DataTypes.STRING(100)` | allowNull: false, unique: true |
| `email` | `email` | `DataTypes.STRING(255)` | allowNull: false, unique: true |
| `password` | `password` | `DataTypes.STRING(255)` | allowNull: false |

**3.2 — Options (second argument to `User.init()`)**
- `sequelize`: the imported sequelize instance — required
- `tableName`: `'users'`
- `timestamps`: `true`
- `underscored`: `true`
- `modelName`: `'User'`

**3.3 — Field-level Validations**
- `email`: Sequelize built-in `isEmail: true`
- `username`: `len: [3, 100]`
- `password`: `len: [6, 255]`

**3.4 — `beforeCreate` Hook**

Register a `beforeCreate` hook that hashes the user's plain-text password using `bcryptjs` before the record is saved. Use a salt rounds value of `10`. This hook must live in the model file — never hash passwords in a controller.

**3.5 — Instance Method: `comparePassword`**

Add an instance method named `comparePassword` directly on the `User` class prototype. This method must:
- Accept a plain-text password string as its argument
- Return a call to `bcrypt.compare(plainPassword, this.password)` — this returns a Promise resolving to `true` or `false`
- This allows the login controller to verify passwords without knowing the hashing details

**3.6 — Export**

Export the `User` class as the default export.

---

### Task 4: Create Restaurant Model (15 points)

In `models/Restaurant.js`, define `class Restaurant extends Model` and call `Restaurant.init()`.

**4.1 — Fields (camelCase keys)**

> ⚠️ All field keys must be **camelCase**. With `underscored: true`, Sequelize automatically maps `cuisineType` → `cuisine_type`, `priceRange` → `price_range`, `isOpen` → `is_open` in the database.

| camelCase Field | DB Column | Sequelize Type | Constraints |
|---|---|---|---|
| `id` | `id` | `DataTypes.INTEGER` | primaryKey: true, autoIncrement: true |
| `name` | `name` | `DataTypes.STRING(255)` | allowNull: false |
| `description` | `description` | `DataTypes.TEXT` | allowNull: true |
| `cuisineType` | `cuisine_type` | `DataTypes.STRING(100)` | allowNull: true |
| `address` | `address` | `DataTypes.STRING(255)` | allowNull: false |
| `latitude` | `latitude` | `DataTypes.DECIMAL(10, 8)` | allowNull: false |
| `longitude` | `longitude` | `DataTypes.DECIMAL(11, 8)` | allowNull: false |
| `location` | `location` | `DataTypes.GEOMETRY('POINT', 4326)` | allowNull: false |
| `rating` | `rating` | `DataTypes.DECIMAL(2, 1)` | allowNull: true, defaultValue: 0 |
| `priceRange` | `price_range` | `DataTypes.ENUM('$','$$','$$$','$$$$')` | allowNull: true, defaultValue: '$$' |
| `phone` | `phone` | `DataTypes.STRING(20)` | allowNull: true |
| `isOpen` | `is_open` | `DataTypes.BOOLEAN` | allowNull: false, defaultValue: true |

**4.2 — Options**
- `sequelize`: the imported sequelize instance
- `tableName`: `'restaurants'`
- `timestamps`: `true`
- `underscored`: `true`
- `modelName`: `'Restaurant'`

**4.3 — Field-level Validations**
- `latitude`: `min: -90`, `max: 90`
- `longitude`: `min: -180`, `max: 180`
- `rating`: `min: 0`, `max: 5`
- `name`: `len: [3, 255]`

**4.4 — `beforeSave` Hook**

Register a `beforeSave` hook that auto-populates `location` from `latitude` and `longitude`. The hook must:
- Check that both `latitude` and `longitude` are present on the instance
- Assign `instance.location` as a GeoJSON Point object with `coordinates: [longitude, latitude]` — longitude is always first in GeoJSON and MySQL WKT convention
- This keeps the spatial column in sync without the controller needing to build it

**4.5 — Associations**

After `Restaurant.init()`, call:
- `Restaurant.hasMany(Product, { foreignKey: 'restaurantId', as: 'products' })`

Import the `Product` model at the top of this file. Both models must be imported in `server.js` before `sequelize.sync()` is called so associations are registered.

**4.6 — Export**

Export the `Restaurant` class as the default export.

---

### Task 5: Create Product Model (10 points)

In `models/Product.js`, define `class Product extends Model` and call `Product.init()`.

**5.1 — Fields (camelCase keys)**

> ⚠️ `restaurantId` maps to `restaurant_id`, `isAvailable` maps to `is_available` via `underscored: true`.

| camelCase Field | DB Column | Sequelize Type | Constraints |
|---|---|---|---|
| `id` | `id` | `DataTypes.INTEGER` | primaryKey: true, autoIncrement: true |
| `restaurantId` | `restaurant_id` | `DataTypes.INTEGER` | allowNull: false |
| `name` | `name` | `DataTypes.STRING(255)` | allowNull: false |
| `description` | `description` | `DataTypes.TEXT` | allowNull: true |
| `price` | `price` | `DataTypes.DECIMAL(10, 2)` | allowNull: false |
| `category` | `category` | `DataTypes.STRING(100)` | allowNull: true |
| `isAvailable` | `is_available` | `DataTypes.BOOLEAN` | allowNull: false, defaultValue: true |

**5.2 — Options**
- `sequelize`: the imported sequelize instance
- `tableName`: `'products'`
- `timestamps`: `true`
- `underscored`: `true`
- `modelName`: `'Product'`

**5.3 — Field-level Validations**
- `price`: `min: 0`
- `name`: `len: [2, 255]`

**5.4 — Associations**

After `Product.init()`, call:
- `Product.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' })`

**5.5 — Export**

Export the `Product` class as the default export.

---

### Task 6: JWT Authentication (15 points)

#### 6.1 — Auth Validator (`validators/authValidator.js`)

Create and export two Joi schemas:

**`registerSchema`**
- `username`: required string, min 3, max 100
- `email`: required string, must be valid email format (use `Joi.string().email()`)
- `password`: required string, min 6, max 100

**`loginSchema`**
- `email`: required string, valid email
- `password`: required string, min 6

#### 6.2 — Auth Middleware (`middleware/authMiddleware.js`)

Create and export a middleware function named `authenticate`. This function must:
1. Read the `Authorization` header from `req.headers`
2. Check it exists and starts with `'Bearer '` — if not, return `401` with `{ success: false, error: 'No token provided' }`
3. Extract the token string from the header
4. Call `jwt.verify(token, process.env.JWT_SECRET)` inside a `try/catch`
5. On success, attach the decoded payload to `req.user` and call `next()`
6. On failure (expired, invalid, malformed), return `401` with `{ success: false, error: 'Invalid or expired token' }`

#### 6.3 — Auth Controller (`controllers/authController.js`)

Create and export two controller functions. Wrap each in `try/catch` and forward errors to `next(err)`.

**`register` (`POST /api/auth/register`)**
1. Validate `req.body` against `registerSchema` with `{ abortEarly: false }` — return `400` on failure
2. Check if a user with the same `email` exists using `User.findOne({ where: { email } })` — return `409` with `{ success: false, error: 'Email already registered' }` if found
3. Call `User.create(validatedValue)` — the `beforeCreate` hook hashes the password automatically
4. Sign a JWT: `jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })`
5. Return `201` with `{ success: true, message: 'User registered successfully', token, data: { id, username, email } }` — never return the hashed password

**`login` (`POST /api/auth/login`)**
1. Validate `req.body` against `loginSchema` — return `400` on failure
2. Find the user with `User.findOne({ where: { email } })` — return `401` with `{ success: false, error: 'Invalid credentials' }` if not found
3. Call `user.comparePassword(req.body.password)` — return `401` with the same error message if the result is `false`
4. Sign a JWT with the same shape as register
5. Return `200` with `{ success: true, message: 'Login successful', token, data: { id, username, email } }`

#### 6.4 — Auth Routes (`routes/authRoutes.js`)

| Method | Path | Controller |
|---|---|---|
| POST | `/register` | `register` |
| POST | `/login` | `login` |

Mount this router in `server.js` at `/api/auth`.

---

### Task 7: MySQL Spatial Queries (15 points)

All proximity logic must run inside MySQL. You may not calculate distances in JavaScript.

**7.1 — Required Spatial Functions**

| Function | Purpose |
|---|---|
| `ST_Distance_Sphere(p1, p2)` | Returns distance in **metres** between two POINT geometries |
| `ST_GeomFromText(wkt, srid)` | Creates a geometry from a WKT string, e.g. `'POINT(lon lat)'` |
| `ST_Within(geom, polygon)` | Returns 1 if a point is inside a polygon |
| `ST_Buffer(point, dist)` | Creates a circle polygon around a point |
| `ST_AsText(geom)` | Converts geometry to human-readable WKT string |

> ⚠️ **Coordinate order**: MySQL WKT is `POINT(longitude latitude)` — longitude always comes first.

> ⚠️ **Units**: `ST_Distance_Sphere` always returns **metres**.

**7.2 — How to Run Spatial Queries with Sequelize**

Sequelize's standard ORM methods cannot build `ST_Distance_Sphere` expressions automatically. For all proximity queries use `sequelize.query()` with `QueryTypes.SELECT`. Always use **named replacements** (`:paramName`) for user-supplied values — never string-interpolate. Compose the WKT `POINT(...)` string using MySQL's `CONCAT` function with separate `:lat` and `:lon` replacements.

**7.3 — Nearby Query Requirements**

The nearby query must:
- Filter rows where `is_open = true`
- Filter rows where `ST_Distance_Sphere(location, <search_point>) <= :radius`
- Conditionally add `AND cuisine_type = :cuisineType` if that filter was provided
- Conditionally add `AND rating >= :minRating` if that filter was provided
- SELECT the scalar columns using their DB column names: `id`, `name`, `cuisine_type`, `address`, `latitude`, `longitude`, `rating`, `price_range`, `phone`, `is_open`
- Compute `ROUND(ST_Distance_Sphere(...), 1) AS distanceMetres`
- **Never SELECT the `location` column** — returning geometry binary breaks JSON serialization
- ORDER BY `distanceMetres ASC`
- LIMIT by the `limit` parameter

**7.4 — Insert**

The `beforeSave` hook in the Restaurant model auto-populates `location`. Use `Restaurant.create()` — no separate raw INSERT is needed.

**7.5 — radius Parameter**

Default `5000` metres (5 km), maximum `50000` (50 km). Include `radiusMetres` in the response body.

---

### Task 8: Restaurant Joi Validation (10 points)

In `validators/restaurantValidator.js`, create and export the following schemas using `Joi.object()`. All field names in schemas must match the **camelCase field names** used in the model and sent in API requests.

**`createRestaurantSchema`**
- `name`: required string, min 3, max 255
- `description`: optional string
- `cuisineType`: optional string, max 100
- `address`: required string
- `latitude`: required number, min -90, max 90
- `longitude`: required number, min -180, max 180
- `rating`: optional number, min 0, max 5
- `priceRange`: optional string, valid values: `'$'`, `'$$'`, `'$$$'`, `'$$$$'`
- `phone`: optional string, max 20
- `isOpen`: optional boolean

**`updateRestaurantSchema`**

Same fields as `createRestaurantSchema` but every field is optional.

**`nearbyQuerySchema`**
- `latitude`: required number, min -90, max 90
- `longitude`: required number, min -180, max 180
- `radius`: optional number, min 1, max 50000, default `5000`
- `limit`: optional integer, min 1, max 100, default `10`
- `cuisineType`: optional string
- `minRating`: optional number, min 0, max 5

**`getAllQuerySchema`**
- `page`: optional integer, min 1, default `1`
- `limit`: optional integer, min 1, max 100, default `10`
- `cuisineType`: optional string
- `priceRange`: optional string, valid values: `'$'`, `'$$'`, `'$$$'`, `'$$$$'`

---

### Task 9: Product Joi Validation (5 points)

In `validators/productValidator.js`, create and export:

**`createProductSchema`**
- `name`: required string, min 2, max 255
- `description`: optional string
- `price`: required number, min 0
- `category`: optional string, max 100
- `isAvailable`: optional boolean

**`updateProductSchema`**

Same fields as `createProductSchema` but every field is optional.

---

### Task 10: Restaurant Controllers (20 points)

All controllers live in `controllers/restaurantController.js`. Import `Restaurant`, `sequelize`, `QueryTypes`, and all restaurant Joi schemas. Wrap every controller in `try/catch` and call `next(err)` on catch.

> ⚠️ Because `underscored: true` is set, use the **camelCase field name** when building Sequelize `where` objects (e.g. `{ cuisineType: 'Italian' }`). Sequelize translates this to `cuisine_type = 'Italian'` in the generated SQL automatically.

#### 10.1 — createRestaurant (`POST /api/restaurants`)
1. Validate `req.body` against `createRestaurantSchema` with `{ abortEarly: false }` — return `400` on failure
2. Call `Restaurant.create(validatedValue)` — the `beforeSave` hook populates `location`
3. Convert the instance to a plain object with `.toJSON()` and delete the `location` key before responding
4. Return `201` with `{ success: true, message: 'Restaurant created successfully', data }`

#### 10.2 — getAllRestaurants (`GET /api/restaurants`)
1. Validate `req.query` against `getAllQuerySchema`
2. Build a Sequelize `where` object using camelCase keys (`cuisineType`, `priceRange`) — only add conditions that were provided in the query
3. Calculate `offset` as `(page - 1) * limit`
4. Call `Restaurant.findAndCountAll()` with the `where` object, `limit`, `offset`, `attributes: { exclude: ['location'] }`, and `order: [['createdAt', 'DESC']]`
5. Return `200` with `{ success: true, count: rows.length, total: count, page, totalPages, data: rows }`

#### 10.3 — getNearbyRestaurants (`GET /api/restaurants/nearby`)
1. Validate `req.query` against `nearbyQuerySchema` — extract `latitude`, `longitude`, `radius`, `limit`, `cuisineType`, `minRating`
2. Build a dynamic SQL WHERE clause string — start with the `is_open` and `ST_Distance_Sphere` conditions, then conditionally append `cuisine_type` and `rating` filters
3. Run the raw query with `sequelize.query()`, `QueryTypes.SELECT`, and named replacements
4. Return `200` with `{ success: true, count, searchLocation: { latitude, longitude }, radiusMetres: radius, data }`

#### 10.4 — getRestaurantById (`GET /api/restaurants/:id`)
1. Parse and validate `req.params.id` as a positive integer — return `400` if invalid
2. Call `Restaurant.findByPk(id, { attributes: { exclude: ['location'] } })`
3. Return `404` if null, otherwise `200` with `{ success: true, data }`

#### 10.5 — updateRestaurant (`PUT /api/restaurants/:id`)
1. Validate the ID param — return `400` if invalid
2. Validate `req.body` against `updateRestaurantSchema` with `{ abortEarly: false }` — return `400` on failure
3. Call `Restaurant.findByPk(id)` — return `404` if not found
4. Call `restaurant.update(validatedValue)` — the `beforeSave` hook re-syncs `location` if `latitude` or `longitude` was included
5. Reload with `restaurant.reload({ attributes: { exclude: ['location'] } })`
6. Return `200` with `{ success: true, message: 'Restaurant updated successfully', data }`

#### 10.6 — deleteRestaurant (`DELETE /api/restaurants/:id`)
1. Validate the ID param
2. Call `Restaurant.findByPk(id)` — return `404` if not found
3. Call `restaurant.destroy()`
4. Return `200` with `{ success: true, message: 'Restaurant deleted successfully' }`

---

### Task 11: Restaurant Routes (5 points)

In `routes/restaurantRoutes.js`, register routes in this exact order — `/nearby` **must** come before `/:id`:

| Method | Path | Controller |
|---|---|---|
| POST | `/` | `createRestaurant` |
| GET | `/` | `getAllRestaurants` |
| GET | `/nearby` | `getNearbyRestaurants` |
| GET | `/:id` | `getRestaurantById` |
| PUT | `/:id` | `updateRestaurant` |
| DELETE | `/:id` | `deleteRestaurant` |

Mount this router in `server.js` at `/api/restaurants`.

---

### Task 12: Product Controllers (15 points)

All controllers live in `controllers/productController.js`. Import `Product`, `Restaurant`, and all product Joi schemas. Apply the `authenticate` middleware to all product routes — unauthenticated requests must receive a `401` response without reaching any controller.

#### 12.1 — createProduct (`POST /api/restaurants/:restaurantId/products`)
1. Parse and validate `req.params.restaurantId` as a positive integer — return `400` if invalid
2. Call `Restaurant.findByPk(restaurantId)` — return `404` with `{ success: false, error: 'Restaurant not found' }` if not found
3. Validate `req.body` against `createProductSchema` with `{ abortEarly: false }` — return `400` on failure
4. Call `Product.create({ ...validatedValue, restaurantId })` to associate the product with the restaurant
5. Return `201` with `{ success: true, message: 'Product created successfully', data }`

#### 12.2 — getProductsByRestaurant (`GET /api/restaurants/:restaurantId/products`)
1. Validate `restaurantId`
2. Call `Restaurant.findByPk(restaurantId)` — return `404` if not found
3. Call `Product.findAll({ where: { restaurantId }, order: [['createdAt', 'DESC']] })`
4. Return `200` with `{ success: true, count: products.length, data: products }`

#### 12.3 — getProductById (`GET /api/restaurants/:restaurantId/products/:productId`)
1. Validate both `restaurantId` and `productId` params
2. Call `Product.findOne({ where: { id: productId, restaurantId } })` — return `404` if not found
3. Return `200` with `{ success: true, data: product }`

#### 12.4 — updateProduct (`PUT /api/restaurants/:restaurantId/products/:productId`)
1. Validate both params
2. Call `Product.findOne({ where: { id: productId, restaurantId } })` — return `404` if not found
3. Validate `req.body` against `updateProductSchema` with `{ abortEarly: false }`
4. Call `product.update(validatedValue)`
5. Return `200` with `{ success: true, message: 'Product updated successfully', data: product }`

#### 12.5 — deleteProduct (`DELETE /api/restaurants/:restaurantId/products/:productId`)
1. Validate both params
2. Call `Product.findOne({ where: { id: productId, restaurantId } })` — return `404` if not found
3. Call `product.destroy()`
4. Return `200` with `{ success: true, message: 'Product deleted successfully' }`

---

### Task 13: Product Routes (5 points)

In `routes/productRoutes.js`:
1. Create the router using `Router({ mergeParams: true })` — **`mergeParams: true` is required** so that `req.params.restaurantId` is accessible inside product controllers when the router is mounted as a nested route
2. Import and apply the `authenticate` middleware as router-level middleware at the top — this protects every product route without repeating it per route
3. Register the following routes:

| Method | Path | Controller |
|---|---|---|
| POST | `/` | `createProduct` |
| GET | `/` | `getProductsByRestaurant` |
| GET | `/:productId` | `getProductById` |
| PUT | `/:productId` | `updateProduct` |
| DELETE | `/:productId` | `deleteProduct` |

4. Mount this router in `server.js` at `/api/restaurants/:restaurantId/products`

---

### Task 14: Server Setup & Error Handling (5 points)

**`middleware/errorHandler.js`**

Implement an Express error handler with exactly four parameters `(err, req, res, next)`. Handle in order:

1. `err.name === 'SequelizeValidationError'` → `400` with `{ success: false, error: 'Validation Error', details: <array of { field, message } objects> }`
2. `err.name === 'SequelizeUniqueConstraintError'` → `409` with `{ success: false, error: 'Duplicate entry' }`
3. `err.name === 'SequelizeDatabaseError'` → `500` with `{ success: false, error: 'Database error', message: err.message }`
4. All other errors → `err.statusCode || 500` with `{ success: false, error: 'Internal server error', message: err.message }`

**`server.js`**

1. Import `express` and `dotenv` — call `dotenv.config()` first
2. Import all routers and the error handler middleware
3. Import `connectDB` and `sequelize` from `config/database.js`
4. Import all three models (`User`, `Restaurant`, `Product`) so their associations are registered before `sequelize.sync()`
5. Add `express.json()` middleware
6. Mount routers:
   - `/api/auth` → `authRoutes`
   - `/api/restaurants` → `restaurantRoutes`
   - `/api/restaurants/:restaurantId/products` → `productRoutes`
7. Register the error handler **after all routes** with `app.use(errorHandler)`
8. Call `connectDB()`, then `sequelize.sync({ alter: true })`, then start the server on `process.env.PORT`

---

### Task 15: Seed Database (Bonus: 10 points)

In `seeders/seedRestaurants.js`:
1. Import `dotenv` and call `dotenv.config()`
2. Import `sequelize`, `Restaurant`, and `Product`
3. Call `sequelize.authenticate()` to verify the connection
4. Truncate `products` first, then `restaurants` (products first to respect the FK constraint)
5. Define at least **20** restaurant objects using camelCase field names to match the model (`cuisineType`, `priceRange`, `isOpen`)
6. Call `Restaurant.bulkCreate(data, { individualHooks: true })` — `individualHooks: true` is required so the `beforeSave` hook fires and populates the `location` POINT for every row
7. For at least 5 restaurants, seed 3–5 products each using `Product.bulkCreate()` with `restaurantId` set correctly
8. Log success counts or errors

---

## 🧪 Testing Requirements

### Manual Testing Checklist

1. **Auth**
   - ✅ Register creates a user — verify the password is hashed in the DB (not stored as plain text)
   - ✅ Duplicate email returns `409`
   - ✅ Login with correct credentials returns a valid JWT token
   - ✅ Login with wrong password returns `401`
   - ✅ All product endpoints return `401` when no `Authorization` header is sent
   - ✅ Expired or tampered token returns `401`

2. **Restaurants**
   - ✅ Create uses camelCase fields (`cuisineType`, `priceRange`, `isOpen`) in both request and response
   - ✅ Invalid `latitude`/`longitude` rejected with camelCase field names in validation error
   - ✅ Get all works with `cuisineType` and `priceRange` filters
   - ✅ Pagination works on get all
   - ✅ Nearby returns `distanceMetres` sorted ascending
   - ✅ Raw `location` binary never appears in any response
   - ✅ Update only changes provided fields
   - ✅ Delete returns success, subsequent GET returns `404`

3. **Products (authenticated)**
   - ✅ Creating a product without a token returns `401`
   - ✅ Creating a product for a non-existent restaurant returns `404`
   - ✅ Created product has correct `restaurantId`
   - ✅ Get all products returns only products for the specified restaurant
   - ✅ `isAvailable` field uses camelCase in both request and response
   - ✅ Update only changes provided fields
   - ✅ Delete removes the product

---

## 📤 Sample API Requests

### Register
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secret123"
}
```
**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "<jwt_token>",
  "data": { "id": 1, "username": "johndoe", "email": "john@example.com" }
}
```

### Login
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{ "email": "john@example.com", "password": "secret123" }
```
**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "<jwt_token>",
  "data": { "id": 1, "username": "johndoe", "email": "john@example.com" }
}
```

### Create Restaurant
```
POST http://localhost:3000/api/restaurants
Content-Type: application/json

{
  "name": "Pizza Palace",
  "cuisineType": "Italian",
  "address": "123 Main St, New York, NY",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "priceRange": "$$",
  "rating": 4.5
}
```
**Expected Response (201):**
```json
{
  "success": true,
  "message": "Restaurant created successfully",
  "data": {
    "id": 1,
    "name": "Pizza Palace",
    "cuisineType": "Italian",
    "address": "123 Main St, New York, NY",
    "latitude": "40.71280000",
    "longitude": "-74.00600000",
    "rating": "4.5",
    "priceRange": "$$",
    "isOpen": true,
    "createdAt": "2024-02-09T10:30:00.000Z",
    "updatedAt": "2024-02-09T10:30:00.000Z"
  }
}
```

### Find Nearby Restaurants
```
GET http://localhost:3000/api/restaurants/nearby?latitude=40.7128&longitude=-74.0060&radius=5000&cuisineType=Italian&minRating=4&limit=10
```
**Expected Response (200):**
```json
{
  "success": true,
  "count": 1,
  "searchLocation": { "latitude": 40.7128, "longitude": -74.006 },
  "radiusMetres": 5000,
  "data": [
    {
      "id": 1,
      "name": "Pizza Palace",
      "cuisine_type": "Italian",
      "address": "123 Main St, New York, NY",
      "latitude": "40.71280000",
      "longitude": "-74.00600000",
      "rating": "4.5",
      "price_range": "$$",
      "is_open": 1,
      "distanceMetres": 0
    }
  ]
}
```
> Note: Raw query results return DB column names (snake_case). This is expected and acceptable for the nearby endpoint since it uses `sequelize.query()`.

### Create Product (requires JWT)
```
POST http://localhost:3000/api/restaurants/1/products
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Margherita Pizza",
  "description": "Classic tomato and mozzarella",
  "price": 12.99,
  "category": "Pizza",
  "isAvailable": true
}
```
**Expected Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "restaurantId": 1,
    "name": "Margherita Pizza",
    "description": "Classic tomato and mozzarella",
    "price": "12.99",
    "category": "Pizza",
    "isAvailable": true,
    "createdAt": "2024-02-09T10:30:00.000Z",
    "updatedAt": "2024-02-09T10:30:00.000Z"
  }
}
```

### Get Products for a Restaurant (requires JWT)
```
GET http://localhost:3000/api/restaurants/1/products
Authorization: Bearer <jwt_token>
```
**Expected Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "restaurantId": 1,
      "name": "Margherita Pizza",
      "price": "12.99",
      "category": "Pizza",
      "isAvailable": true
    }
  ]
}
```

### Unauthorized Request
```
GET http://localhost:3000/api/restaurants/1/products
```
**Expected Response (401):**
```json
{ "success": false, "error": "No token provided" }
```

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    { "field": "latitude", "message": "\"latitude\" must be less than or equal to 90" },
    { "field": "priceRange", "message": "\"priceRange\" must be one of [$, $$, $$$, $$$$]" }
  ]
}
```

---

## 🎯 Grading Rubric

| Task | Points | Criteria |
|------|--------|----------|
| Project Setup | 10 | Correct folder structure, all dependencies installed |
| Database Config | 10 | Sequelize instance, pool config, connectDB, JWT env vars |
| User Model | 10 | `class extends Model`, camelCase fields, `beforeCreate` hash hook, `comparePassword` method |
| Restaurant Model | 15 | `class extends Model`, camelCase fields, `beforeSave` POINT hook, `underscored: true`, associations |
| Product Model | 10 | `class extends Model`, camelCase fields, FK `restaurantId`, `belongsTo` association |
| JWT Auth | 15 | Register/login working, passwords hashed, tokens issued and verified, `authenticate` middleware |
| MySQL Spatial Queries | 15 | `ST_Distance_Sphere` correct, SRID 4326, no JS distance math, `location` never returned |
| Restaurant CRUD | 20 | All 6 controllers, camelCase in `where` objects, validation working |
| Product CRUD | 15 | All 5 controllers, auth protected on all routes, restaurant existence check, `mergeParams: true` |
| Error Handling & Server | 5 | All Sequelize error types handled, server setup correct |
| Routes | 5 | Correct HTTP methods, `/nearby` before `/:id`, product router protected |
| **Total** | **130** | |
| Seed Script (Bonus) | +10 | 20+ restaurants with `individualHooks: true`, products seeded, truncation order correct |

---

## 💡 Tips and Hints

1. **Class-extending syntax is mandatory**: Use `class XModel extends Model` + `XModel.init()` for all three models. `sequelize.define()` is not accepted.
2. **camelCase fields + `underscored: true`**: Define all model field keys in camelCase (`cuisineType`, `priceRange`, `isOpen`, `restaurantId`, `isAvailable`). Setting `underscored: true` in the `init()` options makes Sequelize automatically translate them to `cuisine_type`, `price_range`, `is_open`, `restaurant_id`, `is_available` in the generated SQL.
3. **camelCase in `where` objects**: When building Sequelize `where` objects, always use the camelCase field name — `{ cuisineType: 'Italian' }` — not the DB column name. Sequelize handles the translation.
4. **Raw query results are snake_case**: When you use `sequelize.query()` for the nearby endpoint, MySQL returns column names as they exist in the DB (snake_case). This is expected behaviour and you do not need to transform them.
5. **`sequelize` instance in `init()`**: Always pass the `sequelize` instance in the second argument of `XModel.init()`. Without it the model cannot register with the connection.
6. **`bulkCreate` and hooks**: Always pass `{ individualHooks: true }` in the seed script so `beforeSave` fires for every row and the `location` POINT gets populated.
7. **Never return raw geometry**: Always exclude `location` from responses via `attributes: { exclude: ['location'] }` on Sequelize finders or by listing specific columns in raw SELECT statements.
8. **`mergeParams: true`**: Pass this to `Router()` in `productRoutes.js`. Without it, `req.params.restaurantId` will be `undefined` inside product controllers because nested route parameters don't merge by default.
9. **Route order matters**: Register `GET /nearby` before `GET /:id` in restaurant routes, or Express treats `"nearby"` as an ID value.
10. **Password in responses**: Never return the `password` field in any response. Use `attributes: { exclude: ['password'] }` when querying, or manually delete it from the plain object.
11. **JWT flow**: `authenticate` reads the Bearer token, verifies it with `JWT_SECRET`, and sets `req.user` to the decoded payload. Product controllers can read `req.user.id` if needed.
12. **`abortEarly: false`**: Always pass this to Joi's `validate()` so all field errors are returned at once.
13. **`sequelize.sync({ alter: true })`**: Keeps the DB schema in sync during development without dropping tables. Never use `force: true` in production.

---

## 📚 Learning Resources

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Sequelize Model Class Syntax](https://sequelize.org/docs/v6/core-concepts/model-basics/)
- [Sequelize Hooks](https://sequelize.org/docs/v6/other-topics/hooks/)
- [Sequelize Associations](https://sequelize.org/docs/v6/core-concepts/assocs/)
- [jsonwebtoken npm](https://www.npmjs.com/package/jsonwebtoken)
- [bcryptjs npm](https://www.npmjs.com/package/bcryptjs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Joi Validation](https://joi.dev/api/)
- [MySQL ST_Distance_Sphere](https://dev.mysql.com/doc/refman/8.0/en/spatial-convenience-functions.html#function_st-distance-sphere)
- [MySQL Spatial Data Types](https://dev.mysql.com/doc/refman/8.0/en/spatial-types.html)
- [MySQL Spatial Indexes](https://dev.mysql.com/doc/refman/8.0/en/creating-spatial-indexes.html)

---

## 🚀 Extension Ideas (Advanced Students)

1. Add role-based access control (admin vs regular user)
2. Allow only the restaurant owner to manage its own products
3. Implement restaurant reviews and star ratings
4. Add image upload for restaurant and product photos
5. Add operating hours and auto-compute `isOpen` based on current time
6. Implement full-text search for restaurant and product names
7. Add product pagination and category filtering
8. Add caching with Redis for nearby queries
9. Implement geofencing notifications with WebSockets

---

## 📝 Submission Requirements

1. Complete source code with the exact folder structure from Task 1
2. A working `README.md` with:
   - Step-by-step setup instructions
   - Full API documentation for every endpoint including auth headers
   - Sample `.env` file (placeholder values only — no real credentials)
3. `schema.sql` file with all three `CREATE TABLE` statements
4. Seed script in `seeders/seedRestaurants.js` (bonus)
5. All model hooks and validations must live in the model file — not in controllers
6. All models must use `class extends Model` + `init()` — `sequelize.define()` will lose full marks
7. All model field keys must be **camelCase** — snake_case field keys in models will lose marks

---

## ⏰ Deadline
[Specify your deadline here]

## 📧 Support
For questions or clarification, contact: [Your contact information]

---

**Good luck! Happy coding! 🎉**
