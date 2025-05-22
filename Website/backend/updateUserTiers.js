const mongoose = require('mongoose');
const connectDB = require('./serverConnect'); // Assuming serverConnect.js is in the same directory
const User = require('./models/User'); // Assuming User.js model is in models/

const updateUserTiers = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log('MongoDB Connected for tier update.');

        const users = await User.find({});
        let updatedCount = 0;

        console.log(`Found ${users.length} users. Checking tiers...`);

        for (const user of users) {
            let newTier;
            if (user.balance > 100000000) {
                newTier = 'Diamond';
            } else if (user.balance > 50000000) {
                newTier = 'Gold';
            } else if (user.balance > 10000000) {
                newTier = 'Silver';
            } else {
                newTier = 'Bronze';
            }

            // Update only if the tier has changed or was not set previously
            if (user.tier !== newTier) {
                user.tier = newTier;
                await user.save(); // This will also trigger the pre-save hook in User.js, which is fine.
                console.log(`Updated tier for user ${user.name} (ID: ${user._id}) to ${newTier}.`);
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            console.log(`Successfully updated tiers for ${updatedCount} users.`);
        } else {
            console.log('No users required tier updates.');
        }

    } catch (error) {
        console.error('Error updating user tiers:', error);
    } finally {
        // Disconnect from MongoDB
        try {
            await mongoose.disconnect();
            console.log('MongoDB disconnected.');
        } catch (err) {
            console.error('Error disconnecting MongoDB:', err);
        }
        process.exit(0); // Exit the script
    }
};

// Run the script
updateUserTiers(); 