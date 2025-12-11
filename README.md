cd ~/OneDrive/Desktop/2025-rtt-54/Pro-Tasker/pro-tasker-backend

cat > README.md << 'EOF'
# Pro-Tasker Backend API

RESTful API server for the Pro-Tasker task management application. Built with Node.js, Express, and MongoDB.

## 🚀 Live API

**Base URL:** https://pro-tasker-backend-1-b0pc.onrender.com

## 📋 Features

- User authentication with JWT tokens
- Password hashing with bcrypt
- CRUD operations for projects and tasks
- Ownership-based authorization
- MongoDB with Mongoose ODM
- Input validation and error handling

## 🛠️ Technologies

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure
```
pro-tasker-backend/
├── config/
│   └── database.js           # MongoDB connection
├── controllers/
│   └── userController.js     # User authentication logic
├── middlewares/
│   └── auth.js               # JWT verification middleware
├── models/
│   ├── User.js               # User schema
│   ├── Project.js            # Project schema
│   └── Task.js               # Task schema
├── routes/
│   ├── userRoutes.js         # User endpoints
│   ├── projectRoutes.js      # Project endpoints
│   └── taskRoutes.js         # Task endpoints
├── .env                       # Environment variables
├── server.js                  # Application entry point
└── package.json               # Dependencies
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB

### Environment Variables

Create a `.env` file in the root directory:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_secret_key_here
PORT=4000
FRONTEND_URL=http://localhost:5173
```

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Server will start on `http://localhost:4000`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/users/register` | Register new user | No |
| POST | `/api/users/login` | Login user | No |

### Projects

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects` | Get all user's projects | Yes |
| POST | `/api/projects` | Create new project | Yes |
| GET | `/api/projects/:id` | Get single project | Yes |
| PUT | `/api/projects/:id` | Update project | Yes |
| DELETE | `/api/projects/:id` | Delete project | Yes |

### Tasks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects/:projectId/tasks` | Get all tasks for project | Yes |
| POST | `/api/projects/:projectId/tasks` | Create new task | Yes |
| PUT | `/api/tasks/:taskId` | Update task | Yes |
| DELETE | `/api/tasks/:taskId` | Delete task | Yes |

## 🔐 Authentication

### Registration

**Request:**
```json
POST /api/users/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "_id": "123abc",
  "username": "johndoe",
  "email": "john@example.com",
  "createdAt": "2025-12-11T10:00:00.000Z"
}
```

### Login

**Request:**
```json
POST /api/users/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "123abc",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### Using JWT Token

Include token in Authorization header for protected routes:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String (required, 3-30 chars),
  email: String (required, unique, validated),
  password: String (required, hashed, min 6 chars),
  timestamps: true
}
```

### Project Model
```javascript
{
  name: String (required),
  description: String (required),
  user: ObjectId (ref: 'User'),
  timestamps: true
}
```

### Task Model
```javascript
{
  title: String (required),
  description: String (required),
  status: String (enum: 'To Do', 'In Progress', 'Done'),
  priority: String (enum: 'Low', 'Medium', 'High', 'Urgent'),
  project: ObjectId (ref: 'Project'),
  dueDate: Date,
  timestamps: true
}
```

## 🔒 Security Features

- **Password Hashing:** bcrypt with 12 salt rounds
- **JWT Authentication:** 24-hour token expiration
- **Ownership Validation:** Users can only access their own data
- **Input Validation:** Mongoose schema validation
- **Error Handling:** Centralized error middleware
- **CORS:** Configured for frontend origin

## 🚀 Deployment

Deployed on **Render** as a Web Service:

1. Connect GitHub repository
2. Set build command: `npm install`
3. Set start command: `node server.js`
4. Add environment variables
5. Deploy automatically on git push

## 🔗 Frontend Repository

Frontend code available at: https://github.com/equezada327/pro-tasker-frontend

## 👤 Author

Enrique Quezada
- GitHub: [@equezada327](https://github.com/equezada327)

## 📝 License

This project was created as a capstone project for a software engineering bootcamp.
EOF

