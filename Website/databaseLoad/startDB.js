const { spawn } = require('child_process');
const { readData } = require('./readData');
const path = require('path');

// Function to start the server
const startServer = () => {
    const server = spawn('node', ['../backend/server.js'], { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
    });

    server.on('error', (error) => {
        console.error('Error starting server:', error);
        process.exit(1);
    });

    return server;
};

// Function to display database data
const displayDatabaseData = async () => {
    try {
        console.log('\n=== Database Contents ===\n');
        
        // Get all data
        const data = await readData({ collection: 'all' });
        
        // Display each collection
        for (const [collection, items] of Object.entries(data)) {
            console.log(`\n${collection.toUpperCase()} (${items.length} records):`);
            console.log('----------------------------------------');
            
            items.forEach((item, index) => {
                console.log(`\n[${index + 1}]:`);
                // Format the item data for better readability
                const formattedItem = formatItem(item);
                Object.entries(formattedItem).forEach(([key, value]) => {
                    console.log(`  ${key}: ${value}`);
                });
            });
        }
        
        console.log('\n=== End of Database Contents ===\n');
    } catch (error) {
        console.error('Error displaying database data:', error);
    }
};

// Helper function to format item data
const formatItem = (item) => {
    const formatted = {};
    
    for (const [key, value] of Object.entries(item._doc || item)) {
        // Skip internal MongoDB fields
        if (key === '__v' || key === '_id') continue;
        
        if (Array.isArray(value)) {
            formatted[key] = `[${value.join(', ')}]`;
        } else if (typeof value === 'object' && value !== null) {
            if (value instanceof Date) {
                formatted[key] = value.toLocaleString();
            } else {
                formatted[key] = JSON.stringify(value, null, 2);
            }
        } else {
            formatted[key] = value;
        }
    }
    
    return formatted;
};

// Main function to start everything
const main = async () => {
    try {
        console.log('Starting server and loading database data...\n');
        
        // Start the server
        const server = startServer();
        
        // Wait a bit for the server to start
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Display database data
        await displayDatabaseData();
        
        console.log('\nServer is running and database data has been loaded.');
        console.log('Press Ctrl+C to stop the server.\n');
        console.log('Database viewer available at http://localhost:5000/database\n');
        
        // Handle cleanup on exit
        process.on('SIGINT', () => {
            console.log('\nShutting down...');
            server.kill();
            process.exit();
        });
    } catch (error) {
        console.error('Error in main process:', error);
        process.exit(1);
    }
};

// Run the main function
main(); 