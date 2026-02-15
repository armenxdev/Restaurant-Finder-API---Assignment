import Restaurant from "../models/Restaurant.js";

const restaurants = [
    {
        "name": "Pizza Palace",
        "description": "Best pizza in town",
        "cuisine_type": "Italian",
        "address": "123 Main St, New York, NY",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "rating": 4.5,
        "price_range": "$$",
        "phone": "+1-234-567-8900"
    },
    {
        "name": "Dragon Wok",
        "description": "Authentic Chinese cuisine",
        "cuisine_type": "Chinese",
        "address": "88 Chinatown Ave, San Francisco, CA",
        "latitude": 37.7941,
        "longitude": -122.4078,
        "rating": 4.3,
        "price_range": "$$",
        "phone": "+1-415-222-3344"
    },
    {
        "name": "Sakura Sushi",
        "description": "Fresh sushi and sashimi",
        "cuisine_type": "Japanese",
        "address": "45 Tokyo St, Los Angeles, CA",
        "latitude": 34.0522,
        "longitude": -118.2437,
        "rating": 4.7,
        "price_range": "$$$",
        "phone": "+1-213-555-7788"
    },
    {
        "name": "El Sombrero",
        "description": "Traditional Mexican flavors",
        "cuisine_type": "Mexican",
        "address": "12 Fiesta Rd, Austin, TX",
        "latitude": 30.2672,
        "longitude": -97.7431,
        "rating": 4.4,
        "price_range": "$",
        "phone": "+1-512-777-8899"
    },
    {
        "name": "Spice of India",
        "description": "Rich and spicy Indian food",
        "cuisine_type": "Indian",
        "address": "77 Curry Blvd, Edison, NJ",
        "latitude": 40.5187,
        "longitude": -74.4121,
        "rating": 4.6,
        "price_range": "$$",
        "phone": "+1-732-444-5566"
    },
    {
        "name": "Le Petit Paris",
        "description": "Classic French dining",
        "cuisine_type": "French",
        "address": "9 Rue Lafayette, New York, NY",
        "latitude": 40.7306,
        "longitude": -73.9352,
        "rating": 4.8,
        "price_range": "$$$",
        "phone": "+1-917-333-2211"
    },
    {
        "name": "Berlin Bites",
        "description": "German street food and sausages",
        "cuisine_type": "German",
        "address": "56 Oktober St, Chicago, IL",
        "latitude": 41.8781,
        "longitude": -87.6298,
        "rating": 4.2,
        "price_range": "$$",
        "phone": "+1-312-666-9900"
    },
    {
        "name": "Athens Taverna",
        "description": "Greek traditional dishes",
        "cuisine_type": "Greek",
        "address": "34 Olive Rd, Boston, MA",
        "latitude": 42.3601,
        "longitude": -71.0589,
        "rating": 4.5,
        "price_range": "$$",
        "phone": "+1-617-888-1212"
    },
    {
        "name": "Istanbul Grill",
        "description": "Turkish kebabs and meze",
        "cuisine_type": "Turkish",
        "address": "101 Bosphorus Ave, Paterson, NJ",
        "latitude": 40.9168,
        "longitude": -74.1718,
        "rating": 4.4,
        "price_range": "$$",
        "phone": "+1-973-555-6767"
    },
    {
        "name": "Yerevan Taste",
        "description": "Authentic Armenian home-style food",
        "cuisine_type": "Armenian",
        "address": "5 Ararat St, Glendale, CA",
        "latitude": 34.1425,
        "longitude": -118.2551,
        "rating": 4.9,
        "price_range": "$$",
        "phone": "+1-818-999-4455"
    }
];

const restaurantsWithLocations = restaurants.map((r) => ({
    ...r,
    location: {
        type: 'Point',
        coordinates: [r.latitude, r.longitude],
    }
}));

export const seedRestaurants = async () => {
    try {
        const count = await Restaurant.count();
        if (count > 0) {
            console.log('Database already has restaurants. Seed skipped.');
            return;
        }

        await Restaurant.bulkCreate(restaurantsWithLocations, {
            validate: true,
        });

        console.log('✅ Database seeded successfully');

    } catch (err) {
        console.error('❌ Failed to seed database:', err);
    }
};