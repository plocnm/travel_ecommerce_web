# Travel E-commerce Website

This project is a travel e-commerce website .

## Project Structure

```
.
├── Website
│   ├── backend
│   ├── frontend
│   └── admin 
├── node_modules
├── package-lock.json
├── package.json
├── start.js
└── README.md
```

## Dependencies

The project uses the following main dependencies (from `package.json`):

*   `@react-oauth/google`: ^0.12.2
*   `crypto`: ^1.0.1
*   `google-auth-library`: ^9.15.1
*   `jsonwebtoken`: ^9.0.2
*   `jwt-decode`: ^4.0.0
*   `nodemailer`: ^7.0.3

## Prerequisites

Before running the project, ensure you have the following installed:

*   **Node.js and npm:** Required for running the main start script (`start.js`) and for the backend service (installing dependencies with `npm install` and running `npm start`). You can download Node.js from [https://nodejs.org/](https://nodejs.org/). npm comes bundled with Node.js.
*   **Python:** Required for serving the frontend static files using `python -m http.server`. Most systems have Python pre-installed. If not, you can download it from [https://www.python.org/](https://www.python.org/).

## Running the Project

The project can be started using the `start.js` script:

```bash
node start.js
```

This script will:

1.  Kill any processes currently running on ports 5500 (backend) and 8000 (frontend).
2.  Start the backend server:
    *   Navigates to the `Website/backend` directory.
    *   Runs `npm install` to install backend dependencies.
    *   Runs `npm start` to start the backend server.
    *   The backend will be available at `http://localhost:5500`.
3.  Start the frontend server:
    *   Navigates to the `Website/frontend` directory.
    *   Runs `python -m http.server 8000` to serve the frontend files.
    *   The frontend will be available at `http://localhost:8000`.

Press `Ctrl+C` in the terminal where `node start.js` is running to stop both servers.

## Backend

Located in `Website/backend`.
Presumably a Node.js application (based on `npm start`). Further details would require inspecting the `Website/backend/package.json` or server files.

## Frontend

Located in `Website/frontend`.
Served as static files using Python's HTTP server. Likely contains HTML, CSS, and JavaScript files. If it's a single-page application (SPA) built with a framework like React, Vue, or Angular, the build artifacts would be in this directory.

## Admin

Located in `Website/admin`.
The purpose and technology of the admin section are not immediately clear from the available files and would require further inspection of its contents.