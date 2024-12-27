# User API Documentation

## Base URL
```
/api/user
```

## Authentication
Most endpoints require authentication using JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. User Registration
Register a new user account.

**Endpoint:** `POST /signup`  
**Content-Type:** multipart/form-data

**Request Body:**
```
email: string
username: string
password: string
profilePic: File (optional)
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character (@$!%*?&)

**Success Response:**
```json
{
    "status": true,
    "message": "User successfully registered!",
    "token": "jwt_token",
    "user": {
        "username": "string",
        "email": "string",
        "profilePic": "string",
        "isAdmin": boolean
    }
}
```

### 2. User Login
Login to existing account.

**Endpoint:** `POST /login`  
**Content-Type:** application/json

**Request Body:**
```json
{
    "emailOrusername": "string",
    "password": "string"
}
```

**Success Response:**
```json
{
    "status": true,
    "message": "User logged in successfully",
    "user": {
        "username": "string",
        "email": "string",
        "profilePic": "string"
    }
}
```

### 3. User Logout
Logout from current session.

**Endpoint:** `GET /logout`

**Success Response:**
```json
{
    "status": true,
    "message": "User logged out successfully"
}
```

### Protected Routes
The following endpoints require authentication:

### 4. Get All Users
Retrieve all users except the currently logged-in user.

**Endpoint:** `GET /all-users`  
**Authentication:** Required

**Query Parameters:**
```
search: string (optional) - Search users by username
```

**Success Response:**
```json
[
    {
        "username": "string",
        "email": "string",
        "profilePic": "string",
        "_id": "string"
    }
]
```

### 5. Update Username
Update the username of logged-in user.

**Endpoint:** `PUT /rename-user`  
**Authentication:** Required

**Request Body:**
```json
{
    "newUsername": "string"
}
```

**Success Response:**
```json
{
    "status": true,
    "message": "Username updated successfully!",
    "user": {
        "username": "string",
        "email": "string",
        "profilePic": "string"
    }
}
```

### 6. Update Email
Update the email address of logged-in user.

**Endpoint:** `PUT /emailUpdate`  
**Authentication:** Required

**Request Body:**
```json
{
    "newEmail": "string"
}
```

**Success Response:**
```json
{
    "status": true,
    "message": "Email ID updated successfully!",
    "user": {
        "username": "string",
        "email": "string",
        "profilePic": "string"
    }
}
```

### 7. Update Profile Picture
Update the profile picture of logged-in user.

**Endpoint:** `PUT /picUpdate`  
**Authentication:** Required  
**Content-Type:** multipart/form-data

**Request Body:**
```
profilePic: File
```

**Success Response:**
```json
{
    "status": true,
    "message": "Profile photo updated successfully!"
}
```

### 8. Update Password
Update the password of logged-in user.

**Endpoint:** `PUT /passwordUpdate`  
**Authentication:** Required

**Request Body:**
```json
{
    "currPassword": "string",
    "newPassword": "string"
}
```

**Password Requirements:**
- Same as registration password requirements

**Success Response:**
```json
{
    "status": true,
    "message": "Password Changed successfully",
    "user": {
        "username": "string",
        "email": "string",
        "profilePic": "string"
    }
}
```

### 9. Delete Profile
Delete user account and all associated data.

**Endpoint:** `PUT /del-profile`  
**Authentication:** Required

**Success Response:**
```json
{
    "status": true,
    "message": "User profile and associated chats deleted successfully!",
    "details": {
        "goupChatsDeleted": number,
        "groupChatsRemoved": number,
        "onetTooneChatsDeleted": number
    }
}
```

## Error Responses
All endpoints may return the following error responses:

### 400 Bad Request
```json
{
    "status": false,
    "message": "Error description"
}
```

### 401 Unauthorized
```json
{
    "status": false,
    "message": "Not authorized, token failed"
}
```

### 404 Not Found
```json
{
    "status": false,
    "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
    "status": false,
    "message": "Internal Server Error!",
    "error": "Error details"
}
```

## Notes
- Profile pictures default to "default.jpg" if not provided
- Password must meet the specified complexity requirements
- Email addresses and usernames must be unique
- When deleting a profile:
  - All group chats where user is admin will be deleted
  - User will be removed from group chats where they are a member
  - All one-to-one chats will be deleted
  - All associated messages will be deleted