const { exec } = require('child_process');
const path = require('path');

// Function to kill process on port 5000 if it exists
function killProcessOnPort(port) {
    return new Promise((resolve) => {
        if (process.platform === 'win32') {
            exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
                if (!error && stdout) {
                    const pid = stdout.split(/\s+/)[4];
                    if (pid) {
                        exec(`taskkill /F /PID ${pid}`, () => {
                            console.log(`Killed process on port ${port}`);
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                } else {
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
}

// Main function to start the application
async function startApplication() {
    try {
        // Kill any existing process on port 5000
        await killProcessOnPort(5000);
        
        // Start the backend server
        console.log('Starting backend server...');
        const backendProcess = exec('cd Website/backend && npm run dev', {
            cwd: path.join(__dirname)
        });

        backendProcess.stdout.on('data', (data) => {
            console.log(`Backend: ${data}`);
        });

        backendProcess.stderr.on('data', (data) => {
            console.error(`Backend Error: ${data}`);
        });

        // Wait a moment for backend to start
        setTimeout(() => {
            console.log('\nStarting frontend...');
            // Open the website in the default browser
            exec('start http://localhost:5500');
        }, 3000);

    } catch (error) {
        console.error('Error starting application:', error);
    }
}

// Start the application
startApplication(); 