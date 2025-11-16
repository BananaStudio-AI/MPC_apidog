# 🚀 Apidog Clean Import Checklist - OpenAPI 3.0.3

**Date**: $(date +%Y-%m-%d)  
**Spec**: openapi/api-hub.oas.json  
**Version**: OpenAPI 3.0.3

---

## Pre-Import Checklist

### 1️⃣ Backup Current Project
- [ ] Export current Apidog project
- [ ] Save as: `api-hub-backup-before-303.json`
- [ ] Verify backup file size > 0

### 2️⃣ Remove Old Structure
- [ ] Delete "COMET_API" folder (or all endpoints in it)
- [ ] Delete "FAL_API" folder (or all endpoints in it)
- [ ] Delete "BananaStudio_Internal" folder (if exists)
- [ ] Delete "Utilities" folder (if exists)
- [ ] Check Data Models tab - delete broken/old schemas
- [ ] Verify: No endpoints remain in project

### 3️⃣ Validate Specification Locally
```bash
npm run validate:oas
```
**Expected**: ✓ Passes with only 1 warning (FalEstimate naming pattern)

---

## Import Process

### Choose Your Method:

#### METHOD A: Automated Push (Recommended)
```bash
npm run push:apidog
```

**Monitor output for:**
- [ ] "Successfully uploaded specification"
- [ ] "6 endpoints imported"
- [ ] "13 schemas imported"
- [ ] "0 errors"

#### METHOD B: Manual Import via UI

1. **Open Import Dialog**
   - [ ] Click Import button in Apidog
   - [ ] Select "OpenAPI" format
   - [ ] ⚠️ **Select "OpenAPI 3.0"** (NOT 3.1!)

2. **Select File**
   - [ ] Browse to: `openapi/api-hub.oas.json`
   - [ ] Verify file size: ~94KB
   - [ ] File loads without errors

3. **Configure Import Settings**
   - [ ] ☑ Update existing endpoints: **YES**
   - [ ] ☑ Import tags as folders: **YES**
   - [ ] ☑ Import examples: **YES**
   - [ ] ☑ Import security schemes: **YES**
   - [ ] ☑ Import data models: **YES**
   - [ ] ☑ Delete endpoints not in spec: **YES** (if available)

4. **Execute Import**
   - [ ] Click "Import" button
   - [ ] Wait for completion
   - [ ] Check for warnings/errors

---

## Post-Import Verification

### ✅ Check Folder Structure
- [ ] "COMET_API" folder exists
- [ ] Contains exactly 1 endpoint: `GET /comet/models`
- [ ] "FAL_API" folder exists
- [ ] Contains exactly 5 endpoints:
  - [ ] `GET /fal/models`
  - [ ] `GET /fal/models/pricing`
  - [ ] `POST /fal/models/pricing/estimate`
  - [ ] `GET /fal/models/usage`
  - [ ] `GET /fal/models/analytics`
- [ ] No duplicate folders
- [ ] No orphaned endpoints outside folders

### ✅ Verify Endpoints

**COMET_API → GET /comet/models**
- [ ] Endpoint displays correctly
- [ ] Server shows: `https://api.cometapi.com/v1`
- [ ] Security shows: `CometAuth` (NOT CometBearer)
- [ ] Response tab shows example with 3 sample LLM models
- [ ] Schema reference: `CometModelsResponse`
- [ ] No "undefined" or error badges

**FAL_API → GET /fal/models**
- [ ] Endpoint displays correctly
- [ ] Server shows: `https://api.fal.ai/v1`
- [ ] Security shows: `FalAuth` (NOT FalApiKey)
- [ ] Parameters visible: cursor, limit, category
- [ ] Response tab shows example with 3 sample creative models
- [ ] Schema reference: `FalModelsResponse`
- [ ] Pagination info displays (has_more, next_cursor)

**FAL_API → Other Endpoints**
- [ ] All 5 FAL endpoints visible
- [ ] Each has correct HTTP method
- [ ] Each has correct server URL
- [ ] Each has FalAuth security
- [ ] Request/response schemas render

### ✅ Check Data Models Tab

**COMET Schemas (2)**
- [ ] `CometModel` - shows properties: id, object, created, owned_by
- [ ] `CometModelsResponse` - shows properties: object, data[]

**FAL Schemas (9)**
- [ ] `FalModel` - shows endpoint_id, metadata
- [ ] `FalModelsResponse` - shows models[], has_more, next_cursor
- [ ] `FalPricingResponse` - shows prices[], has_more, next_cursor
- [ ] `FalEstimateRequest` - shows estimate_type, endpoints
- [ ] `FalEstimateResponse` - shows total_cost, breakdown
- [ ] `FalUsageRecord` - shows endpoint_id, date, requests
- [ ] `FalUsageResponse` - shows usage[], total_requests
- [ ] `FalAnalyticsRecord` - shows endpoint_id, metrics
- [ ] `FalAnalyticsResponse` - shows analytics[], period

**Shared Schemas (2)**
- [ ] `UnifiedModelRecord` - shows provider, model_id
- [ ] `ErrorResponse` - shows error.message, error.type

**General Schema Checks**
- [ ] No schemas show "undefined"
- [ ] No red error badges
- [ ] All $ref links resolve
- [ ] Examples display in schema viewer

### ✅ Verify Security Configuration

**Check Environment Settings**
- [ ] Go to: Environment → Security (or Auth tab)
- [ ] `CometAuth` is listed
  - [ ] Type: apiKey
  - [ ] Location: header
  - [ ] Name: Authorization
  - [ ] Format hint shows: Bearer token
- [ ] `FalAuth` is listed
  - [ ] Type: apiKey
  - [ ] Location: header
  - [ ] Name: Authorization
  - [ ] Format hint shows: Key token
- [ ] No `CometBearer` scheme exists (old name)
- [ ] No `FalApiKey` scheme exists (old name)

### ✅ Test Response Examples (Without API Keys)

**Mock Responses**
- [ ] Click any endpoint
- [ ] Go to Response tab
- [ ] Example response displays
- [ ] JSON structure is valid
- [ ] Schema properties match example
- [ ] No rendering errors

### ✅ Test with API Keys (Optional - If Available)

**Comet API Test**
```bash
Endpoint: GET /comet/models
Auth: CometAuth
Token: Bearer YOUR_COMET_KEY
```
- [ ] Request executes
- [ ] Returns 200 OK
- [ ] Response shows ~568 models
- [ ] Response schema validates

**FAL API Test**
```bash
Endpoint: GET /fal/models?limit=10
Auth: FalAuth
Token: Key YOUR_FAL_KEY
```
- [ ] Request executes
- [ ] Returns 200 OK
- [ ] Response shows models array
- [ ] Pagination data present

---

## Troubleshooting

### ❌ Import Shows Warnings
**Symptoms**: Yellow warning messages during import  
**Fix**: Check you selected "OpenAPI 3.0" not "3.1"

### ❌ Schemas Don't Display
**Symptoms**: "undefined" or blank schemas  
**Fix**: 
1. Delete all data models
2. Re-import with "Import data models" enabled

### ❌ Security Schemes Wrong Names
**Symptoms**: Still shows CometBearer or FalApiKey  
**Fix**: 
1. Go to Environment → Security
2. Manually delete old schemes
3. Re-import specification

### ❌ Examples Don't Render
**Symptoms**: Response tab is blank  
**Fix**: 
1. Clear Apidog cache (Settings → Advanced → Clear Cache)
2. Restart Apidog
3. Re-import with "Import examples" enabled

### ❌ Duplicate Endpoints
**Symptoms**: Same endpoint appears twice  
**Fix**: 
1. Delete ALL endpoints before import
2. Re-import fresh

### ❌ Mixed 3.0/3.1 Issues
**Symptoms**: Some schemas work, others don't  
**Fix**: FULL CLEAN IMPORT
1. Backup project
2. Delete everything (endpoints + schemas)
3. Re-import from scratch

---

## Success Criteria

### All Checks Must Pass:
- [x] Validation script passes locally
- [ ] Import completes with 0 errors
- [ ] 6 endpoints imported (1 COMET + 5 FAL)
- [ ] 13 schemas imported (all valid)
- [ ] 2 security schemes configured (CometAuth, FalAuth)
- [ ] Folder structure clean (2 folders)
- [ ] All examples render
- [ ] No "undefined" schemas
- [ ] No red error badges
- [ ] Test requests execute (with keys)

**If ALL checked**: ✅ Clean import successful!  
**If ANY unchecked**: ⚠️ Review troubleshooting section above

---

## Next Steps After Successful Import

1. **Configure Environment Variables**
   - Add your COMET_API_KEY
   - Add your FAL_API_KEY
   - Test actual API calls

2. **Create Test Scenarios**
   - Test Comet model listing
   - Test FAL model filtering
   - Test pricing estimation
   - Test usage tracking

3. **Document Any Custom Workflows**
   - Add to project documentation
   - Share with team

4. **Set Up Automated Testing** (Optional)
   - Use Apidog's automated testing features
   - Create test suites for each provider

---

**Import Date**: _________________  
**Imported By**: _________________  
**Result**: ✅ Success  /  ⚠️ Partial  /  ❌ Failed  

**Notes**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
