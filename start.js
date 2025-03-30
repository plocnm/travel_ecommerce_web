const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Function to run a command and get output
function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout);
        });
    });
}

// Function to kill process on port
async function killProcessOnPort(port) {
    try {
        const cmd = process.platform === 'win32' 
            ? `netstat -ano | findstr :${port}`
            : `lsof -i :${port} -t`;
            
        const output = await runCommand(cmd);
        if (!output) return;

        const lines = output.split('\n');
        const pids = new Set();

        if (process.platform === 'win32') {
            lines.forEach(line => {
                const parts = line.trim().split(/\s+/);
                if (parts.length > 4) {
                    const pid = parts[4];
                    if (pid && pid !== '0') {
                        pids.add(pid);
                    }
                }
            });
        } else {
            lines.forEach(pid => {
                if (pid.trim()) {
                    pids.add(pid.trim());
                }
            });
        }

        // Kill each process
        for (const pid of pids) {
            try {
                const killCmd = process.platform === 'win32'
                    ? `taskkill /F /PID ${pid}`
                    : `kill -9 ${pid}`;
                await runCommand(killCmd);
                console.log(`Killed process ${pid} on port ${port}`);
            } catch (err) {
                console.log(`Failed to kill process ${pid}: ${err.message}`);
            }
        }
    } catch (err) {
        console.log(`Error checking port ${port}: ${err.message}`);
    }
}

// Function to check if port is in use
async function isPortInUse(port) {
    return new Promise((resolve) => {
        const server = http.createServer();
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(true);
            } else {
                resolve(false);
            }
            server.close();
        });
        server.once('listening', () => {
            server.close();
            resolve(false);
        });
        server.listen(port, '0.0.0.0');
    });
}

// Function to kill all node processes
async function killAllNodeProcesses() {
    try {
        if (process.platform === 'win32') {
            await runCommand('taskkill /F /IM node.exe');
        } else {
            await runCommand('pkill -f node');
        }
        console.log('Killed all Node.js processes');
    } catch (err) {
        console.log('No Node.js processes found to kill');
    }
}

// Function to start the server
async function startServer() {
    try {
        console.log('Starting server setup...');

        // Kill all node processes first
        await killAllNodeProcesses();
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Clean up ports
        console.log('Cleaning up ports...');
        await killProcessOnPort(5500);
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Verify port is free
        if (await isPortInUse(5500)) {
            console.error('Port 5500 is still in use. Please restart your computer.');
            process.exit(1);
        }

        // Start the backend server
        console.log('Starting backend server...');
        const backendPath = path.join(__dirname, 'Website', 'backend');
        
        const serverProcess = spawn('npm', ['run', 'dev'], {
            cwd: backendPath,
            shell: true,
            stdio: 'pipe'
        });

        let serverStarted = false;
        let startupTimeout = setTimeout(() => {
            if (!serverStarted) {
                console.error('Server failed to start within 30 seconds');
                serverProcess.kill();
                process.exit(1);
            }
        }, 30000);

        // Handle server output
        serverProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(`Backend: ${output}`);
            
            if (output.includes('Server is running')) {
                serverStarted = true;
                clearTimeout(startupTimeout);
                console.log('Opening website in browser...');
                exec('start http://localhost:5500');
            }
        });

        serverProcess.stderr.on('data', (data) => {
            const error = data.toString();
            console.error(`Backend Error: ${error}`);
            if (error.includes('EADDRINUSE')) {
                console.error('Port is still in use. Please restart your computer.');
                process.exit(1);
            }
        });

        // Handle server exit
        serverProcess.on('exit', (code) => {
            if (code !== 0 && code !== null) {
                console.error(`Server process exited with code ${code}`);
                process.exit(code);
            }
        });

        // Handle process termination
        process.on('SIGINT', () => {
            console.log('\nGracefully shutting down...');
            clearTimeout(startupTimeout);
            serverProcess.kill();
            process.exit(0);
        });

    } catch (error) {
        console.error('Error starting application:', error);
        process.exit(1);
    }
}

// Start the application
console.log('Initializing application...');
startServer(); 