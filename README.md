# Pro-Tasker - Full-Stack MERN Application

A modern, collaborative project management tool built with the MERN stack. This application provides intuitive project and task management for individual users with secure authentication and ownership-based authorization.

## 🎯 Project Overview

Pro-Tasker is a comprehensive full-stack application that allows users to create, manage, and track projects and their associated tasks. Built as a capstone project showcasing advanced MERN stack development with secure authentication, RESTful API design, and responsive frontend implementation.

## ✨ Features

### 🔐 User Management
- **Secure Registration** - Create new user accounts with password hashing
- **JWT Authentication** - Secure login/logout with token-based sessions
- **Session Management** - Persistent login state across browser sessions

### 📊 Project Management
- **Create Projects** - Add new projects with name and description
- **Project Dashboard** - View all user-owned projects in a clean interface
- **Project Details** - Detailed view of individual projects with task summaries
- **Update/Delete** - Full CRUD operations with ownership validation

### ✅ Task Management
- **Task Creation** - Add tasks within projects with title, description, and status
- **Status Tracking** - Manage task progress (To Do, In Progress, Done)
- **Priority Levels** - Set task priorities (Low, Medium, High, Urgent)
- **Due Dates** - Optional due date management with validation
- **Full CRUD** - Complete task management within owned projects

### 🔒 Security Features
- **Ownership-based Authorization** - Users can only access their own data
- **Password Security** - bcrypt hashing with pre-save hooks
- **JWT Token Protection** - All sensitive routes require valid authentication
- **Input Validation** - Comprehensive data validation on both client and server

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with MongoDB Atlas
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing library
- **dotenv** - Environment variable management

### Frontend
- **React 18** - Frontend library with hooks
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Context API** - Global state management
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library

### Deployment
- **Render** - Backend Web Service deployment
- **Render** - Frontend Static Site deployment
- **GitHub** - Version control and CI/CD

## 📁 Project Structure

```
pro-tasker/
├── backend/                    # Express.js API server
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   ├── models/
│   │   ├── User.js           # User schema with password hashing
│   │   ├── Project.js        # Project schema with user reference
│   │   └── Task.js           # Task schema with project reference
│   ├── routes/
│   │   └── api/
│   │       ├── userRoutes.js # Authentication endpoints
│   │       ├── projectRoutes.js # Project CRUD operations
│   │       └── taskRoutes.js # Task management endpoints
│   ├── utils/
│   │   └── auth.js           # JWT middleware and utilities
│   ├── .env                  # Environment variables
│   ├── server.js             # Application entry point
│   └── package.json          # Backend dependencies
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/           # Page-level components
│   │   ├── context/         # React Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service functions
│   │   ├── utils/           # Utility functions
│   │   └── App.jsx          # Main application component
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
└── README.md                # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/pro-tasker.git
   cd pro-tasker/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   MONGO_URI=your_mongodb_atlas_connection_string
   PORT=5000
   JWT_SECRET=your_secure_jwt_secret_at_least_32_characters
   NODE_ENV=development
   ```

4. **Start the backend server**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📚 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: YOUR_RENDER_BACKEND_URL/api
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

#### Login User
- **POST** `/users/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```

#### Get Profile
- **GET** `/users/profile`
- **Headers:** `Authorization: Bearer <token>`

### Project Endpoints

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

## 🏗️ Development Phases

### Phase 1: Backend Foundation ✅
- [x] Project setup and structure
- [x] MongoDB connection and models
- [x] Authentication system with JWT
- [x] User registration and login endpoints

### Phase 2: Core Backend API ✅
- [x] Project CRUD operations with ownership validation
- [x] Task management with project relationship
- [x] Authorization middleware implementation
- [x] Comprehensive error handling

### Phase 3: Frontend Development 🔄
- [ ] React application setup with Vite
- [ ] Client-side routing with React Router
- [ ] Authentication context and hooks
- [ ] Project and task management components
- [ ] Responsive UI design with Tailwind CSS

### Phase 4: Deployment & Polish 📅
- [ ] Backend deployment to Render
- [ ] Frontend deployment to Render
- [ ] Production environment configuration
- [ ] Final testing and optimization

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with secure token handling
- Ownership-based authorization for all resources
- Password hashing using bcrypt with salt rounds
- Protected routes requiring valid authentication

### Data Validation
- Input validation on both client and server sides
- Mongoose schema validation with custom validators
- XSS protection through data sanitization
- SQL injection prevention through parameterized queries

### Error Handling
- Comprehensive error responses without information leakage
- Graceful handling of authentication and authorization failures
- Proper HTTP status codes for all scenarios

## 🚀 Deployment

### Backend Deployment (Render Web Service)
1. Connect GitHub repository to Render
2. Configure environment variables in Render dashboard
3. Set build and start commands
4. Deploy and verify API endpoints

### Frontend Deployment (Render Static Site)
1. Configure build settings for React production build
2. Set environment variables for API URL
3. Deploy and verify frontend functionality
4. Ensure proper communication with backend API

## 🧪 Testing

### Backend Testing
- API endpoint testing with Postman/Insomnia
- Authentication flow validation
- Authorization boundary testing
- Database operation verification

### Frontend Testing
- Component functionality testing
- User interaction flow testing
- Responsive design validation
- Cross-browser compatibility testing

## 📝 Development Guidelines

### Code Quality
- Consistent code formatting and style
- Comprehensive error handling
- Clear variable and function naming
- Modular and reusable components

### Security Best Practices
- Never commit sensitive information to version control
- Use environment variables for all configuration
- Implement proper input validation and sanitization
- Follow principle of least privilege for user permissions

## 🤝 Contributing

This is a capstone project, but contributions and suggestions are welcome:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Bolivar Vega**
- GitHub: [@Bvega](https://github.com/Bvega)
- Project Repository: [pro-tasker-v1](https://github.com/Bvega/pro-tasker-v1)

## 🙏 Acknowledgments

- **Per Scholas** - Full-Stack Development Bootcamp
- **MongoDB University** - Database design principles
- **React Documentation** - Component architecture guidance
- **Express.js Community** - API development best practices

---

## 📊 Project Status

🚀 **IN DEVELOPMENT** - Backend foundation complete, frontend development in progress

**Live URLs:**
- Backend API: [Coming Soon]
- Frontend App: [Coming Soon]

**Next Milestones:**
- Complete React frontend implementation
- Deploy to Render
- Final testing and optimization