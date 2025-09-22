# Tuition Management System (MERN Stack)

A comprehensive tuition management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js) with features for managing students, teachers, batches, attendance, assignments, and payments.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Teacher, Student)
  - Password reset via email

- **User Management**
  - CRUD operations for users
  - Profile management
  - Status toggling (active/inactive)

- **Batch Management**
  - Create and manage batches/courses
  - Assign teachers and students to batches
  - Track batch schedules and fees

- **Attendance Management**
  - Mark attendance for students
  - Bulk attendance upload
  - Attendance reports and analytics

- **Assignment Management**
  - Create and distribute assignments
  - Student submissions
  - Grading and feedback
  - File uploads for assignments

- **Payment Processing**
  - Fee collection tracking
  - Online payment integration (Razorpay)
  - Payment receipts and history
  - Payment reminders

- **Study Materials**
  - Upload and share study materials
  - Organize by batch and subject
  - File upload support

## Tech Stack

- **Frontend**: React.js, Redux Toolkit, React Router, Axios, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **File Upload**: Multer
- **Payments**: Razorpay
- **Emails**: Nodemailer
- **SMS**: Twilio
- **Deployment**: Docker, Nginx (production)

## Prerequisites

- Node.js (v14+)
- MongoDB (v4.4+)
- npm or yarn

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/tuition-management
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   FRONTEND_URL=http://localhost:5173
   FILE_UPLOAD_PATH=./public/uploads
   MAX_FILE_UPLOAD=10485760
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_EMAIL=your_email@gmail.com
   SMTP_PASSWORD=your_email_password
   EMAIL_FROM=Tuition Management <noreply@tuitionmanagement.com>
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

4. Start the development server:
   ```bash
   # Development
   npm run dev

   # Production
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory (or copy `.env.example` to `.env`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_RAZORPAY_KEY=your_razorpay_key_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

API documentation is available at `/api-docs` when running the backend in development mode.

## Deployment

### Backend

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   NODE_ENV=production node server.js
   ```

### Frontend

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `build` folder to your preferred static file hosting service (Netlify, Vercel, etc.)

## Environment Variables

See `.env.example` for a complete list of environment variables.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@tuitionmanagement.com or open an issue on GitHub.
"# tuition" 
