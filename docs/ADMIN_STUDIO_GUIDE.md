# AI Studio - Admin Guide

Complete guide for administrators managing the AI Studio feature.

---

## Table of Contents

1. [Overview](#overview)
2. [Accessing Admin Panel](#accessing-admin-panel)
3. [Dashboard Overview](#dashboard-overview)
4. [Managing Categories](#managing-categories)
5. [Managing Templates](#managing-templates)
6. [Monitoring Usage](#monitoring-usage)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Admin Studio Panel allows you to:
- Monitor image generation statistics
- Create and manage template categories
- Create and manage image templates
- Track user activity
- Analyze success rates

---

## Accessing Admin Panel

### Prerequisites
- Admin account with elevated privileges
- Access to `/admin/studio` route

### Navigation
1. Log in as admin
2. Go to **Admin Dashboard**
3. Click **Studio Management** card
4. Or navigate directly to `/admin/studio`

---

## Dashboard Overview

### Three Main Tabs

#### 1. Overview Tab
Displays key metrics and statistics:
- **Total Images**: All generated images
- **Succeeded Images**: Successfully generated
- **Failed Images**: Failed generations
- **Success Rate**: Percentage of successful generations
- **Total Templates**: Number of templates
- **Active Templates**: Currently active templates
- **Total Categories**: Number of categories
- **Active Categories**: Currently active categories
- **Recent Generations**: Last 10 generations with details

#### 2. Categories Tab
Manage template categories:
- View all categories
- Create new categories
- Edit existing categories
- Deactivate categories

#### 3. Templates Tab
Manage image templates:
- View all templates
- Create new templates
- Edit existing templates
- Deactivate templates

---

## Managing Categories

### Viewing Categories
- All categories displayed in grid layout
- Shows: Name, description, display order, status
- Active categories have green badge
- Inactive categories have gray badge

### Creating a Category

1. Click **Categories** tab
2. Fill in the form:
   - **Name**: Category name (2-100 characters)
   - **Description**: Brief description (optional, max 500 chars)
   - **Display Order**: Number for sorting (0 = first)
   - **Is Active**: Toggle active status

3. Click **Create Category**
4. Category appears in the grid

**Example:**
```
Name: Marketing
Description: Templates for marketing materials, ads, and promotional content
Display Order: 1
Is Active: ✓
```

### Editing a Category

1. Find the category in the grid
2. Click **Edit** button
3. Modify fields in the form
4. Click **Update Category**
5. Changes are saved immediately

### Deactivating a Category

1. Find the category in the grid
2. Click **Deactivate** button
3. Confirm the action
4. Category is soft-deleted (not removed from database)
5. Templates in this category remain but category won't show to users

**Note:** Deactivation is reversible - edit and set Is Active to true

---

## Managing Templates

### Viewing Templates
- All templates displayed in grid layout
- Shows: Title, category, prompt preview, status
- Active templates have green badge
- Inactive templates have gray badge

### Creating a Template

1. Click **Templates** tab
2. Fill in the form:
   - **Title**: Template name (3-255 characters)
   - **Category**: Select from dropdown
   - **Prompt Text**: The actual prompt (10-1000 characters)
   - **Description**: Brief description (optional, max 500 chars)
   - **Thumbnail URL**: Image URL (optional)
   - **Is Active**: Toggle active status

3. Click **Create Template**
4. Template appears in the grid

**Example:**
```
Title: Product Photography - Tech Gadget
Category: E-commerce
Prompt Text: Professional product photography of a sleek modern smartphone, white background, studio lighting, high detail, commercial quality, 4K resolution
Description: Perfect for e-commerce product listings
Thumbnail URL: https://example.com/thumb.jpg (optional)
Is Active: ✓
```

### Writing Effective Template Prompts

**Structure:**
```
[Subject] + [Style] + [Setting] + [Lighting] + [Quality]
```

**Good Examples:**

**Marketing:**
```
Modern minimalist advertisement for luxury watch, elegant composition, 
soft gradient background, professional studio lighting, high-end 
commercial photography, ultra detailed
```

**Social Media:**
```
Vibrant Instagram-style photo of healthy breakfast bowl, overhead shot, 
natural morning light, colorful fresh ingredients, food photography, 
appetizing presentation
```

**E-commerce:**
```
Clean product photo of running shoes, white background, three-quarter 
view, soft shadows, commercial photography, high resolution, detailed 
texture
```

**Education:**
```
Educational infographic showing water cycle, clean vector illustration, 
bright colors, simple diagrams, labeled components, professional design, 
suitable for students
```

**Creative:**
```
Abstract digital art with flowing geometric shapes, vibrant neon colors, 
futuristic aesthetic, smooth gradients, modern design, high contrast, 
4K wallpaper quality
```

### Editing a Template

1. Find the template in the grid
2. Click **Edit** button
3. Modify fields in the form
4. Click **Update Template**
5. Changes are saved immediately

### Deactivating a Template

1. Find the template in the grid
2. Click **Deactivate** button
3. Confirm the action
4. Template is soft-deleted
5. Won't show to users but remains in database

---

## Monitoring Usage

### Key Metrics to Track

#### Success Rate
- **Target**: >90%
- **Good**: 85-90%
- **Needs Attention**: <85%

**If success rate is low:**
1. Check provider API status
2. Review failed generation logs
3. Check for quota limits
4. Verify API keys are valid

#### Popular Templates
- Track which templates are used most
- Create more templates in popular categories
- Remove or update unused templates

#### User Activity
- Monitor recent generations
- Identify peak usage times
- Plan for scaling if needed

### Recent Generations Log

Shows last 10 generations with:
- User ID
- Prompt used
- Provider
- Status (succeeded/failed)
- Credits spent
- Timestamp

**Use this to:**
- Identify problematic prompts
- See which providers are most reliable
- Track credit usage patterns
- Debug user issues

---

## Best Practices

### Category Management

1. **Keep it Simple**: 5-10 categories maximum
2. **Clear Names**: Use descriptive, user-friendly names
3. **Logical Order**: Set display_order thoughtfully
4. **Regular Review**: Remove unused categories quarterly

### Template Management

1. **Quality Over Quantity**: 3-5 templates per category
2. **Test Before Publishing**: Generate images with each template
3. **Clear Descriptions**: Help users understand what they'll get
4. **Regular Updates**: Refresh templates based on trends
5. **User Feedback**: Monitor which templates are popular

### Prompt Writing Tips

**Do:**
- Be specific and detailed
- Use professional terminology
- Include style and quality descriptors
- Test prompts before adding
- Keep prompts 50-200 words

**Don't:**
- Use vague language
- Include contradictions
- Make prompts too complex
- Copy prompts from competitors
- Use offensive or inappropriate content

### Maintenance Schedule

**Daily:**
- Check success rate
- Review recent generations
- Monitor for errors

**Weekly:**
- Analyze template usage
- Update popular templates
- Remove problematic templates

**Monthly:**
- Review all categories
- Add new templates based on trends
- Clean up inactive templates
- Analyze user feedback

---

## Troubleshooting

### Templates Not Showing to Users

**Check:**
1. Is template active? (is_active = true)
2. Is category active?
3. Is prompt text valid? (10-1000 chars)
4. Clear browser cache
5. Check API endpoint: `/api/studio/templates`

### Category Changes Not Reflecting

**Solutions:**
1. Refresh the admin page
2. Check browser console for errors
3. Verify API response
4. Clear cache

### Can't Create Template

**Common Issues:**
1. **Prompt too short**: Minimum 10 characters
2. **Title too short**: Minimum 3 characters
3. **Invalid category**: Select valid category
4. **Network error**: Check internet connection

### High Failure Rate

**Investigate:**
1. Check provider API status
2. Review error logs in backend
3. Check API key validity
4. Monitor quota limits
5. Test with different providers

---

## API Endpoints Reference

### Public Endpoints
```
GET  /api/studio/categories          # List all active categories
GET  /api/studio/templates           # List all active templates
GET  /api/studio/templates?category_id=1  # Filter by category
GET  /api/studio/templates/{id}      # Get single template
```

### Admin Endpoints
```
GET    /api/admin/studio/stats       # Get usage statistics
POST   /api/admin/studio/categories  # Create category
PUT    /api/admin/studio/categories/{id}  # Update category
DELETE /api/admin/studio/categories/{id}  # Deactivate category
POST   /api/admin/studio/templates   # Create template
PUT    /api/admin/studio/templates/{id}   # Update template
DELETE /api/admin/studio/templates/{id}   # Deactivate template
```

---

## Database Schema

### ImageCategory
```sql
id: Integer (Primary Key)
name: String(100)
description: String(500)
display_order: Integer (default: 0)
is_active: Boolean (default: True)
created_at: DateTime
```

### ImageTemplate
```sql
id: Integer (Primary Key)
title: String(255)
category_id: Integer (Foreign Key)
prompt_text: String(1000)
description: String(500)
thumbnail_url: String(500)
is_active: Boolean (default: True)
created_by: Integer (Foreign Key to User)
created_at: DateTime
updated_at: DateTime
```

---

## Security Considerations

1. **Access Control**: Only admins can access `/admin/studio`
2. **Input Validation**: All inputs are validated server-side
3. **Soft Deletes**: Deactivation doesn't delete data
4. **Audit Trail**: All changes are logged with timestamps
5. **API Authentication**: All endpoints require valid JWT token

---

## Support

For technical issues:
- **Backend Logs**: Check `backend/logs/`
- **Database**: Direct access via admin tools
- **API Testing**: Use Postman or curl
- **Frontend Console**: Check browser DevTools

---

**Last Updated**: 2025-10-20
**Version**: 1.0.0

