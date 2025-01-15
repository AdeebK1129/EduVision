# **EduVision**

## **Overview**

EduVision is a platform designed to simplify the note-taking process from video content. By leveraging AI technologies, EduVision generates concise and structured notes from uploaded videos, making it an invaluable tool for students, educators, and professionals.

## Repositories  
- **Frontend Repository**: EduVision Frontend (Next.js)  
- **Backend Repository**: EduVision Backend (Django REST Framework)

## **Features**
- **Video Upload**: Upload video files for automated note generation.
- **AI-Powered Note Generation**: Generate structured notes from video content.
- **User Dashboard**: Manage uploaded videos and view generated notes.
- **Authentication**: Secure login, registration, and token-based authentication.

---

## **Project Structure**

### **Frontend**
- **Next.js**: Framework for building the frontend with server-side rendering.
- **TailwindCSS**: For responsive and modern UI design.

### **Backend**
- **Django REST Framework**: API development and data handling.
- **PostgreSQL**: Database for managing user and video information.

---

## **Getting Started**

### **Tech Stack**
- **Frontend**: Next.js, TailwindCSS
- **Backend**: Django REST Framework
- **Database**: PostgreSQL

### **Prerequisites**
- **Node.js** (>=16.x)
- **Python** (>=3.8)
- **PostgreSQL** (>=13.x)

---

## **Installation**

### **Frontend Setup**
1. Clone the frontend repository:
   ```bash
   git clone git@github.com:your-org/EduVision-frontend.git
   cd frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### **Backend Setup**
1. Clone the backend repository:
   ```bash
   git clone git@github.com:AdeebK1129/EduVision.git
   cd backend
   ```

3. Create a `.env` file with the following structure:
   ```ini
   DATABASE_NAME=eduvision
   DATABASE_USER=postgres
   DATABASE_PWD=password
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DEBUG=True
   SECRET_KEY=django-insecure-key
   ```

5. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

7. Apply migrations and run the server:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py runserver
   ```

---

## **Usage**

1. Start both the frontend and backend servers.
2. Access the application via http://localhost:3000.
3. Use the dashboard to upload videos and generate notes.

---

## **API Specification**

### User Endpoints

**POST** /api/users/register/  
Register a new user.  
Request:
```json
{
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "securepassword123"
}
```
Response:
```json
{
  "message": "User registered successfully.",
  "user": { "id": 1, "username": "johndoe", "email": "johndoe@example.com" },
  "token": "abcd1234token"
}
```

**POST** /api/users/login/  
Authenticate a user and return a token.  
Request:
```json
{
  "email": "johndoe@example.com",
  "password": "securepassword123"
}
```
Response:
```json
{
  "message": "Login successful.",
  "user": { "id": 1, "username": "johndoe", "email": "johndoe@example.com" },
  "token": "abcd1234token"
}
```

**POST** /api/users/logout/  
Log out a user.  
Headers:
Authorization: Token abcd1234token  
Response:
```json
{
  "message": "Logout successful."
}
```

**GET** /api/users/profile/  
Retrieve the authenticated user's profile.  
Headers:
Authorization: Token abcd1234token  
Response:
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "johndoe@example.com"
}
```

**PATCH** /api/users/profile/  
Update user profile details.  
Headers:
Authorization: Token abcd1234token  
Request:
```json
{
  "username": "john_updated"
}
```
Response:
```json
{
  "id": 1,
  "username": "john_updated",
  "email": "johndoe@example.com"
}
```

**POST** /api/users/change-password/  
Change the user's password.  
Headers:
Authorization: Token abcd1234token  
Request:
```json
{
  "old_password": "securepassword123",
  "new_password": "newsecurepassword456"
}
```
Response:
```json
{
  "message": "Password updated successfully."
}
```

---

### Video Endpoints

**POST** /api/videos/upload/  
Upload a new video for processing.  
Headers:
Authorization: Token abcd1234token 
Request:
FormData: { file: video_file }
Response:
```json
{
  "message": "Video uploaded successfully.",
  "video": { "id": 1, "title": "Video Title" }
}
```

**POST** /api/videos/{video_id}/process/  
Process a video and generate notes.
Headers:
Authorization: Token abcd1234token 
Response:
```json
{
  "message": "Processing started for video.",
  "status": "Processing"
}
```

**GET** /api/videos/study-guides/{video_id}/  
Retrieve the generated study guide for a video.  
Headers:
Authorization: Token abcd1234token 
Response:
```json
{
  ### Generated study guide content
}
```

**DELETE** /api/videos/study-guides/{video_id}/  
Delete a study guide.  
Headers:
Authorization: Token abcd1234token 
Response:
```json
{
  "message": "Study guide deleted successfully."
}
```

**GET** /api/videos/  
List all uploaded videos for the authenticated user. 
Headers:
Authorization: Token abcd1234token 
Response:
```json
[
  { "id": 1, "title": "Video Title", "status": "Processed" },
  { "id": 2, "title": "Another Video", "status": "Pending" }
]
```

**DELETE** /api/videos/{video_id}/  
Delete a video.  
Headers:
Authorization: Token abcd1234token 
Response:
```json
{
  "message": "Video deleted successfully."
}
```

---

## **Contributors**
- **Adeeb Khan**
- **Owen Lin**
- **Jeff Chen**
