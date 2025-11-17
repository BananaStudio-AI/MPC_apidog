# Activepieces Integration with MPC-API

Guide for orchestrating automations between Activepieces and the MPC-API service.

## Quick Reference

**Activepieces UI:** http://localhost:8080  
**Location:** `~/ai-infra/activepieces`  
**Docker Compose:** `docker-compose.yml`  
**Environment:** `.env`

---

## Environment Configuration

Add to `~/ai-infra/activepieces/.env`:

```bash
# MPC-API Configuration
MPC_API_BASE_URL=http://localhost:3000
MPC_API_KEY=your-secure-api-key-here
MPC_API_TIMEOUT=120000

# Alternative for Docker network
# MPC_API_BASE_URL=http://mpc-api:3000
```

**Apply changes:**
```bash
cd ~/ai-infra/activepieces
docker compose restart
```

---

## MPC-API Endpoints

### POST /generate/script
Generate video script from prompt.

**Request:**
```json
{
  "prompt": "string",
  "style": "string",
  "duration": 60,
  "context": {
    "notion_page_id": "string",
    "user": "string"
  }
}
```

**Response:**
```json
{
  "id": "string",
  "script": "string",
  "metadata": {}
}
```

---

### POST /generate/thumbnail-prompt
Generate thumbnail image prompt from script.

**Request:**
```json
{
  "script_id": "string",
  "script_content": "string",
  "style_preferences": {
    "art_style": "string",
    "mood": "string"
  },
  "keywords": ["string"]
}
```

**Response:**
```json
{
  "prompt": "string",
  "style_tags": ["string"]
}
```

---

### POST /generate/metadata
Generate metadata for content.

**Request:**
```json
{
  "content": "string",
  "title": "string"
}
```

**Response:**
```json
{
  "title": "string",
  "description": "string",
  "tags": ["string"]
}
```

---

## HTTP Request Step Configuration

### Generate Script

```
Method: POST
URL: {{env.MPC_API_BASE_URL}}/generate/script

Headers:
  Content-Type: application/json
  Authorization: Bearer {{env.MPC_API_KEY}}

Body:
{
  "prompt": "{{trigger.page.title}}",
  "style": "{{trigger.page.properties.style}}",
  "duration": 60,
  "context": {
    "notion_page_id": "{{trigger.id}}",
    "user": "{{trigger.created_by.name}}"
  }
}

Timeout: 120000

Retry:
  Attempts: 3
  Interval: 5000
  On Status: 500-599
```

---

### Generate Thumbnail Prompt

```
Method: POST
URL: {{env.MPC_API_BASE_URL}}/generate/thumbnail-prompt

Headers:
  Content-Type: application/json
  Authorization: Bearer {{env.MPC_API_KEY}}

Body:
{
  "script_id": "{{steps.generate_script.response.body.id}}",
  "script_content": "{{steps.generate_script.response.body.script}}",
  "style_preferences": {
    "art_style": "{{trigger.properties.Style.select.name}}",
    "mood": "{{trigger.properties.Mood.select.name}}"
  },
  "keywords": ["{{trigger.page.properties.tags}}"]
}

Timeout: 60000
```

---

### Generate Metadata

```
Method: POST
URL: {{env.MPC_API_BASE_URL}}/generate/metadata

Headers:
  Content-Type: application/json
  Authorization: Bearer {{env.MPC_API_KEY}}

Body:
{
  "content": "{{steps.generate_script.response.body.script}}",
  "title": "{{trigger.page.title}}"
}

Timeout: 30000
```

---

## Response Access Patterns

### Status & Success Check

```javascript
// HTTP Status
{{steps.http_step.response.status}}

// Success check
{{steps.http_step.response.status >= 200 && steps.http_step.response.status < 300}}

// Is error
{{steps.http_step.response.status >= 400}}
```

### Response Body

```javascript
// Script text
{{steps.generate_script.response.body.script}}

// Script ID
{{steps.generate_script.response.body.id}}

// Metadata object
{{steps.generate_script.response.body.metadata}}

// Thumbnail prompt
{{steps.generate_thumbnail_prompt.response.body.prompt}}

// Error message
{{steps.http_step.response.body.error}}
```

### Response Headers

```javascript
{{steps.http_step.response.headers['content-type']}}
{{steps.http_step.response.headers['x-request-id']}}
```

---

## Example Flow: Notion → MPC-API → Notion

**Trigger:** New Notion Database Item

```
Database ID: your-notion-database-id
Filter:
  Property: Status
  Type: Select
  Condition: equals
  Value: Ready for Script
```

---

**Step 1:** Generate Script (HTTP Request)

```
Display Name: Generate Script from MPC-API
Type: http.send_request
Method: POST
URL: {{env.MPC_API_BASE_URL}}/generate/script
Headers:
  Content-Type: application/json
  Authorization: Bearer {{env.MPC_API_KEY}}
Body:
{
  "prompt": "{{trigger.properties.Title.title[0].plain_text}}",
  "style": "{{trigger.properties.Style.select.name}}",
  "target_duration": 60,
  "context": {
    "notion_page_id": "{{trigger.id}}",
    "user": "{{trigger.created_by.name}}"
  }
}
Timeout: 120000
```

---

**Step 2:** Check Success (Condition)

```
Type: core.branch
Condition:
  Operator: TEXT_EXACTLY_MATCHES
  First Value: {{steps.generate_script.response.status >= 200 && steps.generate_script.response.status < 300}}
  Second Value: true
```

---

**Step 3:** Update Notion Page (Success Branch)

```
Type: notion.update_page
Connection: {{connections.notion}}
Page ID: {{trigger.id}}
Properties:
  Script:
    rich_text:
      - text:
          content: "{{steps.generate_script.response.body.script}}"
  
  Script ID:
    rich_text:
      - text:
          content: "{{steps.generate_script.response.body.id}}"
  
  Status:
    select:
      name: "Script Generated"
  
  Generated At:
    date:
      start: "{{new Date().toISOString()}}"
```

---

**Step 4:** Generate Thumbnail Prompt (HTTP Request)

```
Type: http.send_request
Method: POST
URL: {{env.MPC_API_BASE_URL}}/generate/thumbnail-prompt
Headers:
  Content-Type: application/json
  Authorization: Bearer {{env.MPC_API_KEY}}
Body:
{
  "script_id": "{{steps.generate_script.response.body.id}}",
  "script_content": "{{steps.generate_script.response.body.script}}",
  "style_preferences": {
    "art_style": "{{trigger.properties.Style.select.name}}",
    "mood": "{{trigger.properties.Mood.select.name}}"
  }
}
```

---

**Step 5:** Update Notion with Thumbnail Prompt

```
Type: notion.update_page
Page ID: {{trigger.id}}
Properties:
  Thumbnail Prompt:
    rich_text:
      - text:
          content: "{{steps.generate_thumbnail_prompt.response.body.prompt}}"
```

---

**Step 6:** Error Handler (Failure Branch)

```
Type: notion.create_comment
Page ID: {{trigger.id}}
Comment: "❌ Script generation failed: {{steps.generate_script.response.body.error}}"
```

---

## Notion Property Mappings

### Rich Text Field

```json
{
  "rich_text": [
    {
      "text": {
        "content": "{{variable}}"
      }
    }
  ]
}
```

### Select Field

```json
{
  "select": {
    "name": "Value Name"
  }
}
```

### Multi-Select Field

```json
{
  "multi_select": [
    { "name": "Tag1" },
    { "name": "Tag2" }
  ]
}
```

### Date Field

```json
{
  "date": {
    "start": "{{new Date().toISOString()}}"
  }
}
```

### Number Field

```json
{
  "number": 42
}
```

### URL Field

```json
{
  "url": "https://example.com"
}
```

---

## Error Handling

### Branch on Status Code

```
Type: core.branch
Condition:
  Operator: NUMBER_IS_GREATER_THAN
  First Value: {{steps.generate_script.response.status}}
  Second Value: 399

Then Actions:
  - Log error
  - Update Notion with error message
  - Send notification
```

### Retry Configuration

```
Failure Handling:
  Retry:
    Attempts: 3
    Interval: 5000 (ms)
    Backoff: exponential
  Stop On:
    - 400 (Bad Request)
    - 401 (Unauthorized)
    - 403 (Forbidden)
    - 404 (Not Found)
  Continue On:
    - 500 (Server Error)
    - 502 (Bad Gateway)
    - 503 (Service Unavailable)
    - 504 (Gateway Timeout)
```

---

## Security Best Practices

1. **Never hardcode credentials** in flow definitions
2. **Use environment variables** for base URLs and API keys
3. **Store secrets in Activepieces Connections** when possible
4. **Use HTTPS** for production MPC-API endpoints
5. **Rotate API keys** periodically
6. **Validate responses** before passing data to next steps
7. **Set appropriate timeouts** to prevent hanging flows
8. **Log sensitive data carefully** - avoid logging tokens/keys

---

## Debugging

### View Logs

```bash
cd ~/ai-infra/activepieces
docker compose logs -f activepieces
docker compose logs --tail=100 activepieces
```

### Test HTTP Endpoints

```bash
# Test MPC-API directly
curl -X POST http://localhost:3000/generate/script \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"prompt": "test", "duration": 60}'
```

### Check Container Status

```bash
cd ~/ai-infra/activepieces
docker compose ps
docker compose logs postgres
docker compose logs redis
```

### Restart Services

```bash
cd ~/ai-infra/activepieces
docker compose restart
docker compose restart activepieces
```

---

## Common Flow Patterns

### Sequential Processing

```
Trigger → HTTP Call 1 → Condition → HTTP Call 2 → Update Database
```

### Parallel Processing

```
Trigger → 
  ├─ HTTP Call A (thumbnail) →
  └─ HTTP Call B (metadata)  → Combine Results → Update Database
```

### Error Recovery

```
Trigger → HTTP Call → 
  ├─ Success → Update Database
  └─ Failure → Retry → Send Alert
```

### Scheduled Batch Processing

```
Schedule Trigger → Query Database → Loop → HTTP Call for Each → Update Status
```

---

## Useful Activepieces Expressions

### Date/Time

```javascript
{{new Date().toISOString()}}
{{new Date().getTime()}}
{{new Date().toLocaleDateString()}}
```

### String Operations

```javascript
{{trigger.title.toLowerCase()}}
{{trigger.title.toUpperCase()}}
{{trigger.title.substring(0, 100)}}
{{trigger.title.replace('old', 'new')}}
```

### Array Operations

```javascript
{{trigger.tags.length}}
{{trigger.tags.join(', ')}}
{{trigger.tags[0]}}
```

### Conditional

```javascript
{{condition ? 'true_value' : 'false_value'}}
{{value || 'default'}}
{{value && 'has_value'}}
```

---

## MCP-API Service Setup

If MPC-API is not running yet:

```bash
# Start MPC-API service
cd ~/path/to/mpc-api
docker compose up -d

# Or if running directly
npm start

# Verify it's running
curl http://localhost:3000/health
```

---

## Connection to Other Services

### If MPC-API is in same Docker network:

Update Activepieces `docker-compose.yml`:

```yaml
services:
  activepieces:
    networks:
      - activepieces
      - mpc-api-network

networks:
  activepieces:
  mpc-api-network:
    external: true
```

Then use internal hostname:
```
MPC_API_BASE_URL=http://mpc-api:3000
```

---

## Management Commands

```bash
# Start Activepieces
cd ~/ai-infra/activepieces
docker compose up -d

# Stop Activepieces
docker compose down

# Restart after config changes
docker compose restart

# View all logs
docker compose logs -f

# View specific service
docker compose logs -f activepieces

# Check status
docker compose ps

# Access database directly (if needed)
docker compose exec postgres psql -U postgres -d activepieces

# Backup database
docker compose exec postgres pg_dump -U postgres activepieces > backup.sql
```

---

## Troubleshooting

### Flow not triggering
- Check trigger configuration and filters
- Verify Notion database has required properties
- Check Activepieces logs for errors

### HTTP request failing
- Verify MPC-API is running: `curl http://localhost:3000/health`
- Check API key is correct in `.env`
- Verify base URL is accessible from Activepieces container
- Check timeout settings (increase if needed)
- Review request body format matches API expectations

### Notion update failing
- Verify Notion connection is authorized
- Check property names match exactly (case-sensitive)
- Ensure property types match (rich_text, select, etc.)
- Verify page ID is valid

### Connection refused
- If using Docker network, ensure services are on same network
- Check firewall rules
- Verify port mappings in docker-compose.yml

---

## Resources

- **Activepieces Documentation:** https://www.activepieces.com/docs
- **Activepieces UI:** http://localhost:8080
- **Notion API:** https://developers.notion.com
- **HTTP Methods:** GET, POST, PUT, PATCH, DELETE
- **JSON Format:** https://www.json.org

---

## Next Steps

1. Start Activepieces: `cd ~/ai-infra/activepieces && docker compose up -d`
2. Access UI at http://localhost:8080
3. Create Notion connection
4. Add MPC-API environment variables to `.env`
5. Create your first flow using templates above
6. Test with a sample Notion page
7. Monitor logs for issues
8. Iterate and expand automations

---

*Last Updated: 2025-11-17*
