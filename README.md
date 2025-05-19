# Project Bidding Platform - Backend
This repository contains the backend of the Project Bidding Platform, a web application that connects buyers and sellers for project-based bidding. The backend provides a RESTful API for managing users, projects, bids, and notifications. It is built with Node.js, Express, and Prisma, and deployed on Heroku with a PostgreSQL database.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Approach](#approach)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Local Setup](#local-setup)
  - [Deployment (Heroku)](#deployment-heroku)
  - [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Related Repositories](#related-repositories)
- [Contributing](#contributing)
- [License](#license)

## Features
- **User Authentication**: JWT-based authentication for registering, logging in, and managing users.
- **Project Management**: CRUD operations for projects (create, read, update, delete).
- **Bidding System**: Sellers can place bids with amounts and estimated completion times; buyers can select bids.
- **Email Notifications**: Sends emails to sellers when their bid is selected (using Nodemailer).
- **Database Management**: Uses Prisma ORM with PostgreSQL for data persistence.
- **Role-Based Logic**: Enforces role-based access (buyer/seller) for specific actions.

## Tech Stack
- **Node.js**: JavaScript runtime for the server.
- **Express**: Web framework for building RESTful APIs.
- **Prisma**: ORM for database management with PostgreSQL.
- **Nodemailer**: Library for sending emails (integrated with SendGrid).
- **Heroku**: Hosting platform with Heroku Postgres add-on.
- **PostgreSQL**: Relational database for storing users, projects, and bids.
- **JWT**: JSON Web Tokens for authentication.

## Approach
The backend was designed with scalability and security in mind:
- **RESTful API**: Structured endpoints for users, projects, bids, and notifications.
- **Database Design**: Used Prisma to define models (`User`, `Project`, `Bid`) with relationships.
- **Email Notifications**: Integrated Nodemailer with SendGrid for automated emails (e.g., bid selection notifications).
- **Authentication**: Implemented JWT-based authentication with role-based access control.
- **Error Handling**: Added proper error responses and logging for debugging.

## Project Structure
```
.
├── prisma/
│   └── schema.prisma       # Prisma schema (database models)
├── src/
│   ├── config/
│   │   └── email.js       # Email configuration (Nodemailer setup)
│   ├── routes/ 
│   │   ├── projects.js    # Project-related routes,Bid-related routes (create, fetch, select),Notification routes (send emails tosellers)
│   │   └── users.js       # User-related routes (auth)
│   └── index.js           # Main Express app (entry point)
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Setup Instructions

### Prerequisites
- **Node.js**: Version 20.x (specified in `package.json` engines).
- **npm**: Version 10.x (specified in `package.json` engines).
- **Heroku CLI**: For deployment.
- **PostgreSQL**: Local Postgres for development (Heroku Postgres for production).
- **SendGrid Account**: For email notifications.

### Local Setup
1. **Clone the Repository**:
   ```bash
   git clone <backend-repo-url>
   cd Project-Bidding-Backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Prisma**:
   - Ensure your local Postgres database is running.
   - Create a `.env` file in the root directory and add:
     ```
     DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<dbname>
     ```
   - Generate Prisma client:
     ```bash
     npx prisma generate
     ```
   - Run migrations locally:
     ```bash
     npx prisma migrate dev --name init
     ```

4. **Set Additional Environment Variables**:
   Add the following to your `.env` file (see [Environment Variables](#environment-variables) for details):
   ```
   PORT=5000
   JWT_SECRET=<your-jwt-secret>
   FRONTEND_URL=http://localhost:3000
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USE_TLS=true
   EMAIL_HOST_USER=apikey
   EMAIL_HOST_PASSWORD=<your-sendgrid-api-key>
   ```

5. **Run Locally**:
   ```bash
   npm start
   ```
   - The API will be available at `http://localhost:5000/api`.

### Deployment (Heroku)
1. **Create a Heroku App**:
   ```bash
   heroku create project-bidding-backend
   ```

2. **Add Heroku Postgres Add-On**:
   ```bash
   heroku addons:create heroku-postgresql -a project-bidding-backend
   ```

3. **Set the Node.js Buildpack**:
   ```bash
   heroku buildpacks:set heroku/nodejs -a project-bidding-backend
   ```

4. **Set Environment Variables**:
   ```bash
   heroku config:set PORT=5000 -a project-bidding-backend
   heroku config:set JWT_SECRET=<your-jwt-secret> -a project-bidding-backend
   heroku config:set FRONTEND_URL=https://bidding-system-frontend.vercel.app -a project-bidding-backend
   heroku config:set EMAIL_HOST=smtp.sendgrid.net -a project-bidding-backend
   heroku config:set EMAIL_PORT=587 -a project-bidding-backend
   heroku config:set EMAIL_USE_TLS=true -a project-bidding-backend
   heroku config:set EMAIL_HOST_USER=apikey -a project-bidding-backend
   heroku config:set EMAIL_HOST_PASSWORD=<your-sendgrid-api-key> -a project-bidding-backend
   ```

5. **Deploy to Heroku**:
   ```bash
   git push heroku master
   ```

6. **Apply Database Migrations**:
   ```bash
   heroku run "npm exec prisma migrate deploy" -a project-bidding-backend
   ```

### Environment Variables
| Variable             | Description                              | Example Value                                  |
|----------------------|------------------------------------------|------------------------------------------------|
| `PORT`               | Port for the server                      | `5000`                                         |
| `DATABASE_URL`       | Postgres database URL (auto-set by Heroku) | `postgres://<user>:<password>@<host>:<port>/<dbname>` |
| `JWT_SECRET`         | Secret for JWT signing                   | `<your-jwt-secret>`                            |
| `FRONTEND_URL`       | Frontend URL for CORS and email links    | `https://bidding-system-frontend.vercel.app`  |
| `EMAIL_HOST`         | SMTP host for email                      | `smtp.sendgrid.net`                            |
| `EMAIL_PORT`         | SMTP port                                | `587`                                          |
| `EMAIL_USE_TLS`      | Enable TLS for email                     | `true`                                         |
| `EMAIL_HOST_USER`    | SMTP username (SendGrid: `apikey`)       | `apikey`                                       |
| `EMAIL_HOST_PASSWORD`| SMTP password (SendGrid API key)         | `SG.<your-api-key>`                            |

## API Endpoints
- **Users**:
  - `POST /api/auth/register`: Register a new user (buyer/seller).
  - `POST /api/auth/login`: Log in and receive a JWT.
- **Projects**:
  - `POST /api/projects`: Create a project (buyer only).
  - `GET /api/projects/:id`: Get project details.
  - `GET /api/projects/:id/bids`: Get all bids for a project.

## Related Repositories
- **Frontend**: [Project-Bidding-Frontend](#) (replace with the actual repo URL)
- **Deployed App**:
  - Frontend: [https://bidding-system-frontend.vercel.app/](https://bidding-system-frontend.vercel.app)
  - Backend: [https://project-bidding-backend-e8985cdcf68d.herokuapp.com](https://project-bidding-backend-e8985cdcf68d.herokuapp.com)

## Contributing
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit (`git commit -m "Add your feature"`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Create a pull request.

## License
This project is licensed under the MIT License.
```