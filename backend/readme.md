# Chat Application Backend

This repository contains the backend code for a chat application, offering secure authentication, real-time messaging, and group chat functionalities. Built with **Node.js**, **Express**, and **MongoDB**, the API supports JWT-based authentication, user management, and chat handling.

## Features

### User Management
- **User Registration**: Register new users with secure password validation and optional profile pictures.
- **Login and Logout**: Authenticate users with JWT tokens.
- **Profile Management**: Update usernames, emails, profile pictures, and passwords.
- **Delete Profile**: Remove user accounts and associated data, including chats.

### Messaging
- **One-to-One Messaging**: Send and receive messages between users.
- **File Attachments**: Send messages with optional file attachments.
- **Message History**: Retrieve the message history of any chat.

### Group Chats
- **Create Group Chats**: Create group chats and add participants.
- **Manage Group Membership**: Add or remove users (admin-only operations).
- **Rename Groups**: Update group chat names.
- **Update Group Profile Pictures**: Change group icons.

## API Endpoints

### User API
- **Base URL**: `/api/user`
- **Key Endpoints**:
  - `POST /signup`: Register a new user.
  - `POST /login`: Log in a user.
  - `GET /logout`: Log out a user.
  - `GET /all-users`: Retrieve all users except the current user.
  - `PUT /rename-user`: Update username.
  - `PUT /emailUpdate`: Update email.
  - `PUT /picUpdate`: Update profile picture.
  - `PUT /passwordUpdate`: Update password.
  - `PUT /del-profile`: Delete user profile and associated data.

### Chat API
- **Base URL**: `/api/chats`
- **Key Endpoints**:
  - `POST /access-chat`: Access or create one-on-one chats.
  - `GET /fetch-chat`: Retrieve all chats for the logged-in user.
  - `POST /createGrp`: Create a new group chat.
  - `PUT /rnmGrp`: Rename an existing group chat.
  - `PUT /updtGrpPic`: Update the group profile picture.
  - `PUT /del-Chat`: Delete a chat.
  - `PUT /rmvFromGrp`: Remove a user from a group chat (admin only).
  - `PUT /addToGrp`: Add a user to a group chat (admin only).

### Message API
- **Base URL**: `/api/msg`
- **Key Endpoints**:
  - `PUT /sndMsg`: Send a message in a chat (supports file attachments).
  - `GET /getMsg/:chatId`: Retrieve all messages for a specific chat.

## Setup and Installation

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB**

### Steps
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd chat-application-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Create a `.env` file in the root directory.
   - Add the following:
     ```env
     PORT=5000
     MONGO_URI=<your_mongo_connection_string>
     JWT_SECRET=<your_jwt_secret>
     ```
4. Start the server:
   ```bash
   npm run start
   ```
5. The API will be available at `http://localhost:5000`.

## Technologies Used
- **Node.js**: Backend runtime.
- **Express.js**: Web framework.
- **MongoDB**: Database for storing user, chat, and message data.
- **JWT**: Authentication.
- **Multer**: File upload handling.

## Error Handling
All endpoints return descriptive error messages for invalid inputs, unauthorized access, or server issues. Common error response structure:
```json
{
    "status": false,
    "message": "Error description",
    "error": "Detailed error (if available)"
}
```

## Future Enhancements
- **Real-Time Communication**: Integrate WebSocket or Socket.IO for live messaging.
- **Push Notifications**: Notify users of new messages or group activities.
- **Media Previews**: Generate previews for shared images and files.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request with detailed changes.

---

For any issues or feature requests, feel free to create an issue on GitHub or contact the project maintainer.
