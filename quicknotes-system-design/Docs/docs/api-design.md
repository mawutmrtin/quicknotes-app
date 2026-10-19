
# QuickNotes API Design

## 1. Overview

QuickNotes is a note-taking application. Its API allows users to create, retrieve, update, and delete notes.

The frontend demonstration uses JSONPlaceholder:
`https://jsonplaceholder.typicode.com/posts`

JSONPlaceholder is a mock REST API. Requests such as POST, PATCH, and DELETE simulate changes but do not permanently update the server's data.

The endpoints below describe a proposed production API for a real QuickNotes application.

## 2. Base URL

text
https://api.quicknotes.example/v1


The `.example` domain is a placeholder, not a deployed service.

## 3. API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/notes` | List the authenticated user's notes |
| GET | `/notes/{id}` | Retrieve one note |
| POST | `/notes` | Create a note |
| PATCH | `/notes/{id}` | Update selected note fields |
| DELETE | `/notes/{id}` | Delete a note |
| GET | `/tags` | List available tags |
| POST | `/notes/{id}/tags` | Attach a tag to a note |
| DELETE | `/notes/{id}/tags/{tagId}` | Remove a tag from a note |

## 4. List Notes

### Request

http
GET /v1/notes?limit=20&offset=0
Authorization: Bearer <access_token>
Accept: application/json


The `limit` parameter controls the maximum number of records returned. The `offset` parameter supports pagination.

### Successful response: 200 OK
```json
{
  "data": [
    {
      "id": 101,
      "title": "Study networking",
      "body": "Review VLANs and routing.",
      "user_id": 7,
      "created_at": "2026-10-19T08:00:00Z",
      "updated_at": "2026-10-19T08:00:00Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 1
  }
}


## 5. Create a Note

### Request
http
POST /v1/notes
Authorization: Bearer <access_token>
Content-Type: application/json


json
{
  "title": "Study networking",
  "body": "Review VLANs and routing."
}


### Successful response: 201 Created

json
{
  "data": {
    "id": 102,
    "title": "Study networking",
    "body": "Review VLANs and routing.",
    "user_id": 7,
    "created_at": "2026-10-19T09:00:00Z",
    "updated_at": "2026-10-19T09:00:00Z"
  }
}


The server generates the note ID, user ID from the authenticated session, and timestamps.

## 6. Retrieve a Single Note

### Request

http
GET /v1/notes/102
Authorization: Bearer <access_token>


### Successful response: 200 OK

son
{
  "data": {
    "id": 102,
    "title": "Study networking",
    "body": "Review VLANs and routing.",
    "user_id": 7,
    "created_at": "2026-10-19T09:00:00Z",
    "updated_at": "2026-10-19T09:00:00Z"
  }
}


## 7. Update a Note

### Request

http
PATCH /v1/notes/102
Authorization: Bearer <access_token>
Content-Type: application/json


json
{
  "title": "Study networking and security"
}


### Successful response: 200 OK

json
{
  "data": {
    "id": 102,
    "title": "Study networking and security",
    "body": "Review VLANs and routing.",
    "user_id": 7,
    "created_at": "2026-10-19T09:00:00Z",
    "updated_at": "2026-10-19T09:30:00Z"
  }
}

Only the supplied fields are updated.

## 8. Delete a Note

### Request

http
DELETE /v1/notes/102
Authorization: Bearer <access_token>


### Successful response

http
204 No Content


The response contains no body. The production API must verify that the authenticated user owns the note before deleting it.

## 9. Error Codes

| HTTP status | Meaning | Example |
|---|---|---|
| 400 | Bad Request | Malformed request |
| 401 | Unauthorized | Missing or invalid access token |
| 403 | Forbidden | User lacks permission |
| 404 | Not Found | Note does not exist |
| 409 | Conflict | Conflicting update |
| 413 | Content Too Large | Request exceeds size limit |
| 422 | Validation Error | Empty title |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server failure |
| 503 | Service Unavailable | Service temporarily unavailable |

## 10. Standard Error Response

json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The note title is required.",
    "details": {
      "field": "title"
    },
    "request_id": "req_example_123"
  }
}


Error responses should avoid exposing database details, access tokens, passwords, or internal stack traces.

## 11. Validation and Security

- Require a non-empty title and body.
- Limit the title to 120 characters and body to 5,000 characters.
- Validate request data on the server, even if the frontend also validates it.
- Require authentication for private notes.
- Check note ownership before reading, updating, or deleting a note.
- Use HTTPS for all API traffic.
- Apply rate limiting and request-size limits.
- Use parameterized database queries to prevent SQL injection.
- Return consistent JSON error responses for API errors.

## 12. Frontend Demo Mapping

The frontend in this project uses these JSONPlaceholder endpoints:

| Operation | Demo request |
|---|---|
| Load notes | `GET /posts?_limit=10` |
| Create note | `POST /posts` |
| Delete note | `DELETE /posts/{id}` |

The production API documented above is a design proposal; it is not implemented by JSONPlaceholder.
