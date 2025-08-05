# Attendance Management System

A modern Vue.js application for managing student attendance with QR code functionality, built with Vue 3, TypeScript, DaisyUI, and Tailwind CSS.

## Features

### 🔐 Authentication
- User registration and login
- Role-based access control (Attendee/SBO)
- JWT token authentication
- Automatic token management

### 👥 User Roles

#### Attendee
- View personal profile and QR code
- Log attendance for the day
- View attendance status
- Access to personal dashboard

#### SBO (Student Body Organization)
- View all attendees list
- Scan QR codes to mark attendance
- View individual attendee QR codes
- Access attendance records
- Manage attendance tracking

### 📊 Attendance Management
- QR code generation for each user
- Real-time attendance tracking
- AM/PM session tracking
- Attendance history and records
- Bulk attendance operations

### 🎨 UI/UX Features
- Modern, responsive design with DaisyUI
- Dark/light theme toggle
- Mobile-friendly interface
- Real-time loading states
- Error handling and user feedback

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### User Profile
- `GET /api/me` - Get logged-in user's profile
- `GET /api/me/qr` - Get user's QR code

### SBO Operations
- `GET /api/sbo/attendees` - Get all attendees list
- `POST /api/sbo/scan/{id}` - Scan/mark attendee attendance
- `GET /api/sbo/attendees/{id}/qr` - Get specific attendee's QR code

### Attendance
- `POST /api/attendance/log` - Log attendance (for attendees)
- `GET /api/attendance` - Get attendance records

### Utilities
- `GET /api/year-levels` - Get available year levels

## Project Structure

```
src/
├── components/
│   └── Navbar.vue          # Navigation component
├── services/
│   └── api.ts              # API service layer
├── stores/
│   └── auth.ts             # Authentication store
├── types/
│   └── auth.ts             # TypeScript type definitions
├── views/
│   ├── Dashboard.vue       # Main dashboard
│   ├── Login.vue           # Login page
│   ├── Register.vue        # Registration page
│   ├── QrView.vue          # QR code viewer
│   ├── AttendanceLog.vue   # Attendance logging
│   └── AttendanceViewer.vue # Attendance records viewer
└── router/
    └── index.ts            # Vue Router configuration
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:8000`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-vue-daisyui-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Usage

### For Attendees
1. Register or login with your credentials
2. View your profile and QR code on the dashboard
3. Click "Log My Attendance" to record your attendance
4. View your attendance status

### For SBO Officers
1. Login with SBO credentials
2. Access the dashboard to view all attendees
3. Use QR scanner or manual attendance marking
4. View attendance records and statistics
5. Access individual attendee QR codes

## Technology Stack

- **Frontend Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Styling**: Tailwind CSS + DaisyUI
- **State Management**: Vue 3 Reactive API
- **Routing**: Vue Router 4
- **Build Tool**: Vite
- **Package Manager**: npm

## API Response Examples

### Login Response
```json
{
  "message": "Login successful",
  "token": "7|FoZyfp4fM3Q96jcegpapXMx6q0XTY5Ba6b75biRU8ca17e26",
  "user": {
    "id": 6,
    "full_name": "SBO Officer",
    "email": "sbo3@example.com",
    "role": "SBO",
    "qr_code_path": "qr_codes/qr_6.png"
  },
  "qr_code_url": "http://localhost:8000/storage/qr_codes/qr_6.png"
}
```

### Attendees List
```json
[
  {
    "id": 2,
    "full_name": "Test User",
    "email": "test@example.com",
    "course": "Computer Science",
    "gender": "Male",
    "year_level": "1st Year",
    "qr_code_path": "qr_codes/qr_2.png",
    "qr_code_url": "http://localhost:8000/storage/qr_codes/qr_2.png",
    "has_attended": 0
  }
]
```

### Attendance Records
```json
[
  {
    "id": 1,
    "attendee_id": 4,
    "date": "2025-08-04",
    "am_in": "07:56:33",
    "am_out": null,
    "pm_in": null,
    "pm_out": null,
    "created_at": "2025-08-04T04:53:21.000000Z",
    "updated_at": "2025-08-04T07:56:33.000000Z",
    "attendee": {
      "id": 4,
      "full_name": "Test Attendee",
      "email": "attendee@example.com",
      "course": "Computer Science",
      "gender": "Male",
      "year_level_id": 1,
      "qr_code_path": "qr_codes/qr_4.png",
      "has_attended": 0,
      "role": "Attendee",
      "position": null
    }
  }
]
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
# VUEJS_FRONTEND_ATTENDANE-MS
# VUEJS_FRONTEND_ATTENDANE-MS
