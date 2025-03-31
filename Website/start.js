const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
    backend: {
        port: 5500,
        path: path.join(__dirname, 'Website', 'backend')
    },
    frontend: {
        port: 8000,
        path: path.join(__dirname, 'Website', 'frontend')
    }
};

// Store child processes
let processes = {
    backend: null,
    frontend: null
};

// Function to check if a port is in use
function isPortInUse(port) {
    return new Promise((resolve) => {
        const net = require('net');
        const server = net.createServer();
        server.once('error', () => resolve(true));
        server.once('listening', () => {
            server.close();
            resolve(false);
        });
        server.listen(port);
    });
}

// Function to kill process on a specific port
async function killProcessOnPort(port) {
    try {
        if (process.platform === 'win32') {
            await new Promise((resolve, reject) => {
                exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    const lines = stdout.split('\n');
                    for (const line of lines) {
                        const match = line.match(/\s+(\d+)$/);
                        if (match) {
                            const pid = match[1];
                            exec(`taskkill /F /PID ${pid}`, (err) => {
                                if (err) {
                                    console.error(`Error killing process ${pid}:`, err);
                                }
                                resolve();
                            });
                        }
                    }
                    resolve();
                });
            });
        } else {
            await new Promise((resolve, reject) => {
                exec(`lsof -i :${port} | grep LISTEN | awk '{print $2}' | xargs kill -9`, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        }
        console.log(`Cleaned up port ${port}`);
    } catch (error) {
        console.error(`Error cleaning up port ${port}:`, error);
    }
}

// Function to start servers
async function startServers() {
    console.log('Starting Travel E-commerce Website...');

    // Clean up existing processes
    await killProcessOnPort(config.backend.port);
    await killProcessOnPort(config.frontend.port);

    // Start backend server
    console.log('Starting backend server...');
    processes.backend = exec('npm install && npm start', {
        cwd: config.backend.path
    });

    processes.backend.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`);
    });

    processes.backend.stderr.on('data', (data) => {
        console.error(`Backend Error: ${data}`);
    });

    // Wait for backend to start
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Start frontend server
    console.log('Starting frontend server...');
    processes.frontend = exec('python -m http.server 8000', {
        cwd: config.frontend.path
    });

    processes.frontend.stdout.on('data', (data) => {
        console.log(`Frontend: ${data}`);
    });

    processes.frontend.stderr.on('data', (data) => {
        console.error(`Frontend Error: ${data}`);
    });

    console.log('\nWebsite is starting up...');
    console.log(`Backend will be available at: http://localhost:${config.backend.port}`);
    console.log(`Frontend will be available at: http://localhost:${config.frontend.port}`);
    console.log('\nPress Ctrl+C to stop all servers...');
}

// Function to stop all servers
async function stopServers() {
    console.log('\nStopping all servers...');
    
    // Kill processes
    if (processes.backend) {
        processes.backend.kill();
    }
    if (processes.frontend) {
        processes.frontend.kill();
    }

    // Clean up ports
    await killProcessOnPort(config.backend.port);
    await killProcessOnPort(config.frontend.port);

    console.log('All servers stopped.');
    process.exit(0);
}

// Handle process termination
process.on('SIGINT', stopServers);
process.on('SIGTERM', stopServers);

// Start the servers
startServers().catch(error => {
    console.error('Error starting servers:', error);
    process.exit(1);
}); 