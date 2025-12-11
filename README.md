# TaskMaster API

A secure RESTful API for project and task management built with Node.js, Express, and MongoDB. This backend application provides complete user authentication, project management, and task tracking capabilities with robust authorization controls.

## 🎯 Project Overview

TaskMaster API is a comprehensive backend solution designed for productivity applications. It implements industry-standard security practices with JWT authentication, bcrypt password hashing, and ownership-based authorization to ensure data integrity and user privacy.

## ✨ Features

### 🔐 Authentication & Security
- **User Registration** with secure password hashing using bcrypt
- **JWT-based Authentication** with token expiration
- **Protected Routes** with middleware authorization
- **Ownership-based Access Control** - users can only access their own data

### 📊 Project Management
- **Create Projects** with descriptions and status tracking
- **Full CRUD Operations** on user-owned projects
- **Project Ownership Verification** for all operations
- **Status Management** (Active, Completed, On Hold, Cancelled)

### ✅ Task Management
- **Nested Task Creation** within projects
- **Task Status Tracking** (To Do, In Progress, Done)
- **Priority Levels** (Low, Medium, High, Urgent)
- **Due Date Management** with validation
- **Complex Authorization** - access tasks only through owned projects

### 🗄️ Data Relationships
- **User → Projects** (One-to-Many relationship)
- **Project → Tasks** (One-to-Many relationship)
- **MongoDB References** with proper population
- **Cascade Deletion** - removing projects deletes associated tasks

## 🛠️ Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT)
- **Security:** bcrypt for password hashing
- **Environment:** dotenv for configuration
- **Development:** nodemon for hot reloading

## 📁 Project Structure

```
taskmaster-api-app/
├── config/
│   └── database.js          # MongoDB connection configuration
├── models/
│   ├── User.js             # User schema with password hashing
│   ├── Project.js          # Project schema with user reference
│   └── Task.js             # Task schema with project reference
├── routes/
│   └── api/
│       ├── userRoutes.js   # Authentication endpoints
│       ├── projectRoutes.js # Project CRUD operations
│       └── taskRoutes.js   # Task management endpoints
├── utils/
│   └── auth.js             # JWT middleware and utilities
├── .env                    # Environment variables (not in repo)
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies and scripts
├── server.js              # Application entry point
└── README.md              # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/taskmaster-api-app.git
   cd taskmaster-api-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=3000
   JWT_SECRET=your_secure_jwt_secret_at_least_32_characters_long
   ```

4. **Start the server**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Verify installation**
   ```bash
   curl http://localhost:3000/
   # Expected: {"message":"TaskMaster API is running!"}
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
- **POST** `/users/register`
- **Body:**
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response:** User object with JWT token

#### Login User
- **POST** `/users/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response:** User object with JWT token

#### Get Profile
- **GET** `/users/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Current user profile

### Project Endpoints

All project endpoints require authentication via JWT token in the Authorization header.

#### Create Project
- **POST** `/projects`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "My Project",
    "description": "Project description",
    "status": "Active"
  }
  ```

#### Get All Projects
- **GET** `/projects`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `status`, `sort`, `order`

#### Get Single Project
- **GET** `/projects/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Update Project
- **PUT** `/projects/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Fields to update

#### Delete Project
- **DELETE** `/projects/:id`
- **Headers:** `Authorization: Bearer <token>`

### Task Endpoints

#### Get Project Tasks
- **GET** `/projects/:projectId/tasks`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `status`, `priority`, `sort`, `order`

#### Create Task
- **POST** `/projects/:projectId/tasks`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "title": "Task Title",
    "description": "Task description",
    "status": "To Do",
    "priority": "Medium",
    "dueDate": "2024-12-31"
  }
  ```

#### Update Task
- **PUT** `/tasks/:taskId`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Fields to update

#### Delete Task
- **DELETE** `/tasks/:taskId`
- **Headers:** `Authorization: Bearer <token>`

#### Quick Status Update
- **PATCH** `/tasks/:taskId/status`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "status": "In Progress"
  }
  ```

#### Get All User Tasks
- **GET** `/tasks`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `status`, `priority`, `project`, `sort`, `order`

#### Get Task Statistics
- **GET** `/tasks/stats`
- **Headers:** `Authorization: Bearer <token>`

## 🧪 Testing the API

### Using Postman or Insomnia

1. **Health Check**
   ```
   GET http://localhost:3000/
   ```

2. **Register a new user**
   ```
   POST http://localhost:3000/api/users/register
   Content-Type: application/json
   
   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "password123"
   }
   ```

3. **Login to get JWT token**
   ```
   POST http://localhost:3000/api/users/login
   Content-Type: application/json
   
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

4. **Create a project (use token from login)**
   ```
   POST http://localhost:3000/api/projects
   Authorization: Bearer YOUR_JWT_TOKEN
   Content-Type: application/json
   
   {
     "name": "Test Project",
     "description": "A test project"
   }
   ```

5. **Create a task (use project ID from previous response)**
   ```
   POST http://localhost:3000/api/projects/PROJECT_ID/tasks
   Authorization: Bearer YOUR_JWT_TOKEN
   Content-Type: application/json
   
   {
     "title": "Test Task",
     "description": "A test task"
   }
   ```

### Security Testing

Verify the security features by testing:

- **Unauthorized Access:** Try accessing protected routes without a token
- **Invalid Tokens:** Use expired or malformed tokens
- **Cross-User Access:** User A trying to access User B's projects/tasks
- **Ownership Validation:** Modifying resources owned by other users

All these attempts should return appropriate error responses (401 Unauthorized or 403 Forbidden).

## 🔒 Security Features

### JWT Authentication
- Tokens expire in 7 days
- Secret key validation
- Automatic token verification on protected routes

### Password Security
- bcrypt hashing with 12 salt rounds
- Passwords never stored in plain text
- Password comparison using secure methods

### Authorization Layers
- **Route-level:** Authentication required for all protected endpoints
- **Resource-level:** Users can only access their own projects
- **Nested-level:** Task access verified through project ownership

### Data Validation
- Input validation using Mongoose schemas
- Email format validation
- Password strength requirements
- Date validation for due dates

## 🌍 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/taskmaster` |
| `PORT` | Server port number | `3000` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secure_secret_key_here` |

## 📝 Database Schema

### User Schema
```javascript
{
  username: String (required, 3-30 chars),
  email: String (required, unique, validated),
  password: String (required, hashed with bcrypt),
  createdAt: Date,
  updatedAt: Date
}
```

### Project Schema
```javascript
{
  name: String (required, 3-100 chars, unique per user),
  description: String (required, max 500 chars),
  status: String (enum: Active, Completed, On Hold, Cancelled),
  user: ObjectId (ref: User, required),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Schema
```javascript
{
  title: String (required, 3-100 chars),
  description: String (required, max 1000 chars),
  status: String (enum: To Do, In Progress, Done),
  priority: String (enum: Low, Medium, High, Urgent),
  project: ObjectId (ref: Project, required),
  dueDate: Date (optional, must be future date),
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Prerequisites for deployment:
- MongoDB Atlas account (for cloud database)
- Environment variables configured on hosting platform
- Node.js runtime support

### Recommended Platforms:
- **Railway:** Easy Node.js deployment
- **Render:** Free tier available
- **Heroku:** Popular choice for Node.js apps
- **DigitalOcean App Platform:** Professional hosting

### Deployment Steps:
1. Set up environment variables on your platform
2. Configure MongoDB Atlas with appropriate IP whitelist
3. Update CORS settings if serving a frontend
4. Set NODE_ENV to 'production'

## 🤝 Contributing

This is an educational project, but contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 👨‍💻 Author

**Bolivar Vega**
- GitHub: https://github.com/Bvega/taskmaster-api-app.git
- Email: bolivar.vega@gmail.com

## 🙏 Acknowledgments

- **Per Scholas** for the comprehensive backend development curriculum
- **MongoDB University** for database design principles
- **Express.js** community for excellent documentation
- **JWT.io** for token debugging tools

---

## 📊 Project Status

✅ **COMPLETED** - All project requirements fulfilled
- ✅ Authentication system implemented
- ✅ Authorization with ownership verification
- ✅ Full CRUD operations functional
- ✅ Security testing completed
- ✅ Documentation comprehensive
- ✅ Ready for production deployment

