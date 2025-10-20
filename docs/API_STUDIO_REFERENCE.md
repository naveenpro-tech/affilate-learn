# AI Studio API Reference

Complete API documentation for the AI Studio feature.

---

## Base URL

```
Development: http://localhost:8000
Production: https://api.yourplatform.com
```

## Authentication

All endpoints require JWT authentication via Bearer token.

```http
Authorization: Bearer <your_jwt_token>
```

---

## Public Studio Endpoints

### 1. Get Categories

List all active image categories.

**Endpoint:** `GET /api/studio/categories`

**Authentication:** Required

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Marketing",
      "description": "Templates for marketing materials",
      "display_order": 1,
      "is_active": true,
      "created_at": "2025-10-20T10:00:00"
    }
  ],
  "total": 5
}
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Invalid or missing token

---

### 2. Get Templates

List all active templates, optionally filtered by category.

**Endpoint:** `GET /api/studio/templates`

**Authentication:** Required

**Query Parameters:**
- `category_id` (optional): Filter by category ID

**Examples:**
```http
GET /api/studio/templates
GET /api/studio/templates?category_id=1
```

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Product Photography - Tech Gadget",
      "category_id": 1,
      "prompt_text": "Professional product photography...",
      "description": "Perfect for e-commerce",
      "thumbnail_url": null,
      "is_active": true,
      "created_by": 1,
      "created_at": "2025-10-20T10:00:00",
      "updated_at": "2025-10-20T10:00:00",
      "category_name": "E-commerce"
    }
  ],
  "total": 15
}
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Invalid token

---

### 3. Get Single Template

Get details of a specific template.

**Endpoint:** `GET /api/studio/templates/{template_id}`

**Authentication:** Required

**Path Parameters:**
- `template_id`: Template ID (integer)

**Response:**
```json
{
  "id": 1,
  "title": "Product Photography - Tech Gadget",
  "category_id": 1,
  "prompt_text": "Professional product photography...",
  "description": "Perfect for e-commerce",
  "thumbnail_url": null,
  "is_active": true,
  "created_by": 1,
  "created_at": "2025-10-20T10:00:00",
  "updated_at": "2025-10-20T10:00:00",
  "category_name": "E-commerce"
}
```

**Status Codes:**
- `200 OK`: Success
- `404 Not Found`: Template not found
- `401 Unauthorized`: Invalid token

---

### 4. Enhance Prompt

Enhance a user's prompt using AI.

**Endpoint:** `POST /api/studio/enhance-prompt`

**Authentication:** Required

**Request Body:**
```json
{
  "prompt": "a beautiful cat"
}
```

**Validation:**
- `prompt`: Required, min 10 characters, max 1000 characters

**Response:**
```json
{
  "original_prompt": "a beautiful cat",
  "enhanced_prompt": "A majestic cat with piercing green eyes, sitting gracefully on a velvet cushion, soft natural lighting, professional photography, high detail"
}
```

**Status Codes:**
- `200 OK`: Success
- `422 Unprocessable Entity`: Validation error
- `401 Unauthorized`: Invalid token

**Error Response:**
```json
{
  "detail": "Prompt must be at least 10 characters"
}
```

---

### 5. Generate Image

Generate an AI image from a prompt.

**Endpoint:** `POST /api/studio/generate`

**Authentication:** Required

**Request Body:**
```json
{
  "prompt": "A beautiful sunset over mountains",
  "tier": "standard",
  "provider": "auto"
}
```

**Parameters:**
- `prompt`: Required, min 10 characters
- `tier`: Optional, one of: `standard`, `premium2`, `premium4` (default: `standard`)
- `provider`: Optional, one of: `auto`, `mock`, `huggingface`, `openai_dalle`, `gemini_nano_banana`, `replicate` (default: `auto`)

**Response:**
```json
{
  "job_id": "hf-abc123def456",
  "status": "succeeded",
  "image_url": "http://localhost:8000/static/generated/2025/10/20/user-1-123456-abc.png",
  "credits_used": 1
}
```

**Status Codes:**
- `200 OK`: Success
- `422 Unprocessable Entity`: Validation error
- `402 Payment Required`: Insufficient credits
- `401 Unauthorized`: Invalid token

**Error Responses:**
```json
{
  "detail": "Insufficient credits. You have 0 credits, need 1"
}
```

```json
{
  "detail": "Prompt must be at least 10 characters"
}
```

---

### 6. Get Generation Status

Check the status of an image generation.

**Endpoint:** `GET /api/studio/generate/{job_id}`

**Authentication:** Required

**Path Parameters:**
- `job_id`: Job ID from generate response

**Response:**
```json
{
  "job_id": "hf-abc123def456",
  "status": "succeeded",
  "image_url": "http://localhost:8000/static/generated/2025/10/20/user-1-123456-abc.png",
  "error": null
}
```

**Status Values:**
- `pending`: Generation in progress
- `succeeded`: Generation complete
- `failed`: Generation failed

**Status Codes:**
- `200 OK`: Success
- `404 Not Found`: Job not found
- `401 Unauthorized`: Invalid token

---

### 7. Get My Creations

List user's generated images.

**Endpoint:** `GET /api/studio/my-creations`

**Authentication:** Required

**Query Parameters:**
- `cursor`: Optional, pagination cursor (default: 0)
- `limit`: Optional, number of items (default: 20, max: 100)

**Example:**
```http
GET /api/studio/my-creations?cursor=0&limit=20
```

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "prompt_text": "A beautiful sunset",
      "enhanced_prompt": "A breathtaking sunset...",
      "image_url": "http://localhost:8000/static/generated/...",
      "tier": "standard",
      "provider": "huggingface",
      "status": "succeeded",
      "created_at": "2025-10-20T10:00:00"
    }
  ],
  "total": 10,
  "next_cursor": 20
}
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Invalid token

---

### 8. Get Credits Balance

Get user's current credit balance.

**Endpoint:** `GET /api/studio/credits`

**Authentication:** Required

**Response:**
```json
{
  "credits": 50
}
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Invalid token

---

### 9. Purchase Credits

Purchase studio credits.

**Endpoint:** `POST /api/studio/purchase-credits`

**Authentication:** Required

**Request Body:**
```json
{
  "credits": 10,
  "transaction_id": "txn_abc123"
}
```

**Parameters:**
- `credits`: Required, integer, min 1
- `transaction_id`: Required, unique transaction identifier

**Response:**
```json
{
  "credits": 60,
  "amount_paid": 50.00,
  "transaction_id": "txn_abc123"
}
```

**Status Codes:**
- `200 OK`: Success
- `422 Unprocessable Entity`: Validation error
- `402 Payment Required`: Payment failed
- `401 Unauthorized`: Invalid token

---

## Admin Studio Endpoints

All admin endpoints require admin privileges.

### 1. Get Studio Stats

Get usage statistics.

**Endpoint:** `GET /api/admin/studio/stats`

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "total_images": 1000,
  "succeeded_images": 950,
  "failed_images": 50,
  "templates": 15,
  "categories": 5,
  "recent_generations": [
    {
      "id": 100,
      "user_id": 5,
      "status": "succeeded",
      "created_at": "2025-10-20T10:00:00"
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Success
- `403 Forbidden`: Not an admin
- `401 Unauthorized`: Invalid token

---

### 2. Create Category

Create a new image category.

**Endpoint:** `POST /api/admin/studio/categories`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Marketing",
  "description": "Templates for marketing materials",
  "display_order": 1,
  "is_active": true
}
```

**Validation:**
- `name`: Required, 2-100 characters
- `description`: Optional, max 500 characters
- `display_order`: Optional, integer (default: 0)
- `is_active`: Optional, boolean (default: true)

**Response:**
```json
{
  "id": 1,
  "name": "Marketing",
  "description": "Templates for marketing materials",
  "display_order": 1,
  "is_active": true,
  "created_at": "2025-10-20T10:00:00"
}
```

**Status Codes:**
- `200 OK`: Success
- `422 Unprocessable Entity`: Validation error
- `403 Forbidden`: Not an admin

---

### 3. Update Category

Update an existing category.

**Endpoint:** `PUT /api/admin/studio/categories/{category_id}`

**Authentication:** Required (Admin only)

**Request Body:** (All fields optional)
```json
{
  "name": "Marketing & Ads",
  "description": "Updated description",
  "display_order": 2,
  "is_active": true
}
```

**Response:** Same as Create Category

**Status Codes:**
- `200 OK`: Success
- `404 Not Found`: Category not found
- `422 Unprocessable Entity`: Validation error
- `403 Forbidden`: Not an admin

---

### 4. Deactivate Category

Soft delete a category.

**Endpoint:** `DELETE /api/admin/studio/categories/{category_id}`

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "message": "Category deactivated successfully"
}
```

**Status Codes:**
- `200 OK`: Success
- `404 Not Found`: Category not found
- `403 Forbidden`: Not an admin

---

### 5. Create Template

Create a new image template.

**Endpoint:** `POST /api/admin/studio/templates`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "title": "Product Photography - Tech Gadget",
  "category_id": 1,
  "prompt_text": "Professional product photography of a sleek modern smartphone...",
  "description": "Perfect for e-commerce product listings",
  "thumbnail_url": "https://example.com/thumb.jpg",
  "is_active": true
}
```

**Validation:**
- `title`: Required, 3-255 characters
- `category_id`: Required, valid category ID
- `prompt_text`: Required, 10-1000 characters
- `description`: Optional, max 500 characters
- `thumbnail_url`: Optional, max 500 characters
- `is_active`: Optional, boolean (default: true)

**Response:**
```json
{
  "id": 1,
  "title": "Product Photography - Tech Gadget",
  "category_id": 1,
  "prompt_text": "Professional product photography...",
  "description": "Perfect for e-commerce",
  "thumbnail_url": "https://example.com/thumb.jpg",
  "is_active": true,
  "created_by": 1,
  "created_at": "2025-10-20T10:00:00",
  "updated_at": "2025-10-20T10:00:00",
  "category_name": "E-commerce"
}
```

**Status Codes:**
- `200 OK`: Success
- `422 Unprocessable Entity`: Validation error
- `403 Forbidden`: Not an admin

---

### 6. Update Template

Update an existing template.

**Endpoint:** `PUT /api/admin/studio/templates/{template_id}`

**Authentication:** Required (Admin only)

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Title",
  "category_id": 2,
  "prompt_text": "Updated prompt...",
  "description": "Updated description",
  "thumbnail_url": "https://example.com/new-thumb.jpg",
  "is_active": true
}
```

**Response:** Same as Create Template

**Status Codes:**
- `200 OK`: Success
- `404 Not Found`: Template not found
- `422 Unprocessable Entity`: Validation error
- `403 Forbidden`: Not an admin

---

### 7. Deactivate Template

Soft delete a template.

**Endpoint:** `DELETE /api/admin/studio/templates/{template_id}`

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "message": "Template deactivated successfully"
}
```

**Status Codes:**
- `200 OK`: Success
- `404 Not Found`: Template not found
- `403 Forbidden`: Not an admin

---

## Error Handling

### Standard Error Response

```json
{
  "detail": "Error message here"
}
```

### Common Status Codes

- `200 OK`: Request successful
- `401 Unauthorized`: Missing or invalid authentication token
- `402 Payment Required`: Insufficient credits or payment failed
- `403 Forbidden`: Insufficient permissions (not admin)
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

---

## Rate Limiting

- **Public Endpoints**: 100 requests/minute per user
- **Admin Endpoints**: 200 requests/minute per admin
- **Image Generation**: 10 generations/minute per user

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

---

## Webhooks (Future)

Coming in Phase 2:
- Generation complete webhook
- Credit purchase webhook
- Template usage webhook

---

**Last Updated**: 2025-10-20
**API Version**: 1.0.0

