const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../backend/models/User');
const Hotel = require('../backend/models/Hotel');
const Flight = require('../backend/models/Flight');
const Tour = require('../backend/models/Tour');
const Booking = require('../backend/models/Booking');

// Function to read data from a collection
const readCollection = async (model, query = {}, options = {}) => {
    try {
        const data = await model.find(query, options);
        console.log(`Found ${data.length} records in ${model.modelName}`);
        return data;
    } catch (error) {
        console.error(`Error reading from ${model.modelName}:`, error);
        throw error;
    }
};

// Function to read data with pagination
const readWithPagination = async (model, page = 1, limit = 10, query = {}) => {
    try {
        const skip = (page - 1) * limit;
        const data = await model.find(query)
            .skip(skip)
            .limit(limit);
        const total = await model.countDocuments(query);
        
        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error(`Error reading from ${model.modelName} with pagination:`, error);
        throw error;
    }
};

// Function to read data with sorting
const readWithSort = async (model, sortField, sortOrder = 'asc', query = {}) => {
    try {
        const sortOptions = {};
        sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;
        
        const data = await model.find(query).sort(sortOptions);
        return data;
    } catch (error) {
        console.error(`Error reading from ${model.modelName} with sorting:`, error);
        throw error;
    }
};

// Function to read data with filtering
const readWithFilter = async (model, filters) => {
    try {
        const data = await model.find(filters);
        return data;
    } catch (error) {
        console.error(`Error reading from ${model.modelName} with filters:`, error);
        throw error;
    }
};

// Main function to read data
const readData = async (options = {}) => {
    const {
        collection = 'all', // 'all', 'users', 'hotels', 'flights', 'tours', 'bookings'
        query = {},
        page,
        limit,
        sortField,
        sortOrder,
        filters
    } = options;

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        let result = {};

        // Read data based on collection
        if (collection === 'all') {
            result = {
                users: await readCollection(User, query),
                hotels: await readCollection(Hotel, query),
                flights: await readCollection(Flight, query),
                tours: await readCollection(Tour, query),
                bookings: await readCollection(Booking, query)
            };
        } else {
            const modelMap = {
                users: User,
                hotels: Hotel,
                flights: Flight,
                tours: Tour,
                bookings: Booking
            };

            const model = modelMap[collection];
            if (!model) {
                throw new Error(`Invalid collection: ${collection}`);
            }

            if (page && limit) {
                result = await readWithPagination(model, page, limit, query);
            } else if (sortField) {
                result = await readWithSort(model, sortField, sortOrder, query);
            } else if (filters) {
                result = await readWithFilter(model, filters);
            } else {
                result = await readCollection(model, query);
            }
        }

        console.log('Data reading completed successfully');

        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');

        return result;
    } catch (error) {
        console.error('Error reading data:', error);
        throw error;
    }
};

module.exports = { readData }; 