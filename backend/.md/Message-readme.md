# Message API Documentation

## Base URL
```
/api/msg
```

---

## **Send Message**
### Endpoint
```
PUT /sndMsg
```

### Description
Sends a message in a specific chat. Supports attaching a file to the message.

### Request Headers
| Key             | Value                       |
|-----------------|-----------------------------|
| Authorization   | Bearer <JWT Token>          |

### Request Body (JSON)
| Field           | Type      | Required | Description                           |
|-----------------|-----------|----------|---------------------------------------|
| chatId          | String    | Yes      | ID of the chat to send the message to |
| content         | String    | Yes      | Content of the message               |

### Request Parameters
| Field           | Type      | Description                           |
|-----------------|-----------|---------------------------------------|
| attachment      | File      | (Optional) File to attach to the message |

### Response (200 - Success)
```json
{
    "status": true,
    "message": "Message sent successfully!",
    "data": {
        "_id": "<messageId>",
        "sender": {
            "_id": "<userId>",
            "username": "<username>",
            "profilePic": "<profilePicUrl>"
        },
        "content": "<content>",
        "chat": {
            "_id": "<chatId>",
            "latestMessage": {
                "_id": "<messageId>",
                "sender": {
                    "_id": "<userId>",
                    "username": "<username>"
                }
            }
        },
        "attachment": "<fileName>",
        "createdAt": "<timestamp>",
        "updatedAt": "<timestamp>"
    }
}
```

### Error Responses
#### 400 - Bad Request
```json
{
    "status": false,
    "message": "Chat ID and message content are required"
}
```
#### 403 - Forbidden
```json
{
    "status": false,
    "message": "<username> is not authorized to send the message in this chat!"
}
```
#### 404 - Not Found
```json
{
    "status": false,
    "message": "Chat not found!"
}
```
#### 500 - Internal Server Error
```json
{
    "status": false,
    "message": "Internal Server Error!",
    "error": "<error_message>"
}
```

---

## **Get All Messages**
### Endpoint
```
GET /getMsg/:chatId
```

### Description
Retrieves all messages in a specific chat.

### Request Headers
| Key             | Value                       |
|-----------------|-----------------------------|
| Authorization   | Bearer <JWT Token>          |

### Path Parameters
| Field           | Type      | Required | Description                           |
|-----------------|-----------|----------|---------------------------------------|
| chatId          | String    | Yes      | ID of the chat                       |

### Response (200 - Success)
```json
{
    "status": true,
    "messages": "Messages retrieved successfully!",
    "data": [
        {
            "_id": "<messageId>",
            "sender": {
                "_id": "<userId>",
                "username": "<username>",
                "profilePic": "<profilePicUrl>"
            },
            "content": "<content>",
            "chat": {
                "_id": "<chatId>",
                "latestMessage": {
                    "_id": "<messageId>",
                    "sender": {
                        "_id": "<userId>",
                        "username": "<username>"
                    }
                }
            },
            "attachment": "<fileName>",
            "createdAt": "<timestamp>",
            "updatedAt": "<timestamp>"
        }
    ]
}
```

### Error Responses
#### 400 - Bad Request
```json
{
    "status": false,
    "message": "Chat not found!"
}
```
#### 403 - Forbidden
```json
{
    "status": false,
    "message": "<username> is not authorized to send the message in this chat!"
}
```
#### 404 - Not Found
```json
{
    "status": false,
    "message": "No messages found for this chat!"
}
```
#### 500 - Internal Server Error
```json
{
    "status": false,
    "message": "Internal Server Error!",
    "error": "<error_message>"
}
```

---

## Middleware and Utilities
### Protected Route Middleware
- Ensures the user is authenticated before accessing the route.

### File Upload Middleware
- Handles file uploads for attachments.

---

## Notes
- Ensure the `Authorization` header contains a valid JWT token.
- Replace `<your-domain>` with the actual domain or localhost URL where the API is hosted.
