# Chat API Documentation

## Base URL
```
/api/chats
```

## Authentication
All endpoints require authentication using JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Access or Create Chat
Create a new chat or access existing one-on-one chat.

**Endpoint:** `POST /access-chat`  
**Authentication:** Required

**Request Body:**
```json
{
    "friendId": "string" // ID of user to chat with
}
```

**Success Response:**
```json
{
    "status": true,
    "message": "Chat retrieved successfully!" | "Chat created successfully!",
    "chat": {
        "chatName": "string",
        "isGroupChat": false,
        "users": [...],
        "latestMessage": {...}
    }
}
```

### 2. Fetch All Chats
Retrieve all chats for the logged-in user.

**Endpoint:** `GET /fetch-chat`  
**Authentication:** Required

**Success Response:**
```json
{
    "status": true,
    "message": "Chats fetched successfully",
    "chats": [
        {
            "chatName": "string",
            "isGroupChat": boolean,
            "users": [...],
            "groupAdmin": {...},
            "latestMessage": {...}
        }
    ]
}
```

### 3. Create Group Chat
Create a new group chat.

**Endpoint:** `POST /createGrp`  
**Authentication:** Required

**Request Body:**
```json
{
    "users": "string", // JSON string of user IDs
    "name": "string"   // Group name
}
```

**Success Response:**
```json
{
    "status": true,
    "message": "Group Chat created successfully!",
    "chat": {
        "chatName": "string",
        "users": [...],
        "isGroupChat": true,
        "groupPic": "string",
        "groupAdmin": {...}
    }
}
```

### 4. Rename Group
Rename an existing group chat.

**Endpoint:** `PUT /rnmGrp`  
**Authentication:** Required

**Request Body:**
```json
{
    "chatId": "string",
    "chatName": "string"
}
```

**Success Response:**
```json
{
    "status": true,
    "message": "Group Chat renamed successfully",
    "chat": {
        "chatName": "string",
        "users": [...],
        "groupAdmin": {...}
    }
}
```

### 5. Update Group Profile Picture
Update the profile picture of a group.

**Endpoint:** `PUT /updtGrpPic`  
**Authentication:** Required  
**Content-Type:** multipart/form-data

**Request Body:**
```
chatId: string
groupPic: File
```

**Success Response:**
```json
{
    "status": true,
    "message": "Group picture updated successfully",
    "chat": {
        "chatName": "string",
        "groupPic": "string",
        "users": [...],
        "groupAdmin": {...}
    }
}
```

### 6. Delete Chat
Delete a one-on-one chat or group chat.

**Endpoint:** `PUT /del-Chat`  
**Authentication:** Required

**Request Body:**
```json
{
    "chatId": "string"
}
```

**Success Response:**
```json
{
    "status": true,
    "message": "Chat deleted successfully",
    "chatDetails": {
        "type": "Group Chat" | "One-to-One Chat",
        "name": "string",
        "participants": [...],
        "deletedBy": "string"
    }
}
```

### Admin-Only Operations

#### 7. Remove User from Group
Remove a user from a group chat (Admin only).

**Endpoint:** `PUT /rmvFromGrp`  
**Authentication:** Required

**Request Body:**
```json
{
    "chatId": "string",
    "userId": "string"
}
```

**Success Response:**
```json
{
    "status": true,
    "message": "User removed from group successfully",
    "chat": {
        "chatName": "string",
        "users": [...],
        "groupAdmin": {...}
    }
}
```

#### 8. Add User to Group
Add a user to a group chat (Admin only).

**Endpoint:** `PUT /addToGrp`  
**Authentication:** Required

**Request Body:**
```json
{
    "chatId": "string",
    "userId": "string"
}
```

**Success Response:**
```json
{
    "status": true,
    "message": "User added to group successfully",
    "chat": {
        "chatName": "string",
        "users": [...],
        "groupAdmin": {...}
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

### 403 Forbidden
```json
{
    "status": false,
    "message": "Not authorized to perform this action"
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