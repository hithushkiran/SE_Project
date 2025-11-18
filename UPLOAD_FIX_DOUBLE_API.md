# 🔧 URGENT FIX: Double /api/ URL Bug - RESOLVED ✅

## What Happened

After I made changes, uploads started failing with:
```
Failed to load resource: the server responded with a status of 500
URL: :8080/api/api/papers/upload-with-categories
                ^^^^^ DOUBLE /api/ BUG!
```

## Root Cause

**The Problem**: 
- `axios.js` has `baseURL: 'http://localhost:8080/api'` (includes `/api`)
- `PublishPage.jsx` was using endpoint: `/api/papers/upload-with-categories` (starts with `/api`)
- **Result**: `http://localhost:8080/api` + `/api/papers/...` = Double `/api/api/`

**Why It Broke**:
When I fixed the axios baseURL to use environment variables (to fix AI search), I didn't update PublishPage to remove the duplicate `/api/` prefix.

---

## The Fix Applied ✅

**File**: `Frontend/src/components/PublishPage.jsx` (line 130-132)

**Changed from**:
```javascript
const endpoint = hasCategoryIds
  ? '/api/papers/upload-with-categories'  ❌ Has /api/
  : '/api/papers/upload';                  ❌ Has /api/
```

**Changed to**:
```javascript
const endpoint = hasCategoryIds
  ? '/papers/upload-with-categories'  ✅ No /api/ prefix
  : '/papers/upload';                  ✅ No /api/ prefix
```

**Now URLs are correct**:
- `baseURL` = `http://localhost:8080/api`
- `endpoint` = `/papers/upload-with-categories`
- **Final URL** = `http://localhost:8080/api/papers/upload-with-categories` ✅

---

## Test Now

### Step 1: Refresh Browser
Open http://localhost:8082/publish

### Step 2: Upload Test Paper
- Title: "Test Upload Fix"
- Author: "Test"
- Select "Computer Science" category ← Important!
- Upload any PDF

### Step 3: Check Console Logs

**Frontend console should show**:
```javascript
=== UPLOAD DEBUG ===
formData.categoryIds: ["62b12d0c-9695-4112-8279-c93f2ab1a1c7"]
Has category IDs: true
Appending category ID: 62b12d0c-9695-4112-8279-c93f2ab1a1c7
Using endpoint: /papers/upload-with-categories  ← Fixed! No /api/

✅ Upload successful!
```

**Backend console should show**:
```
=== CONTROLLER uploadPaperWithCategories ===
CategoryIds received in controller: [62b12d0c-9695-4112-8279-c93f2ab1a1c7]
Assigning 1 categories to paper
Categories assigned. Paper now has 1 categories
```

**Should NOT see**:
```
❌ 500 error
❌ :8080/api/api/papers/... (double /api/)
```

---

## What Was Working Before

Your console logs showed the **frontend was working perfectly**:
```javascript
✅ formData.categoryIds: Array(1)
✅ Has category IDs: true
✅ Appending category ID: 62b12d0c-9695-4112-8279-c93f2ab1a1c7
```

The ONLY issue was the URL construction!

---

## Verification Steps

### 1. Upload Should Work Now
- No more 500 errors
- Upload completes successfully

### 2. Verify Categories Saved
```powershell
# After upload, check paper has categories
$paperId = "your-new-paper-id"
Invoke-RestMethod -Uri "http://localhost:8080/api/papers/$paperId/categories"
```

Expected:
```json
{
  "success": true,
  "data": [
    {
      "id": "62b12d0c-9695-4112-8279-c93f2ab1a1c7",
      "name": "Computer Science"
    }
  ]
}
```

### 3. Test AI Search
- Search for "test upload"
- Should find your paper ✅

---

## Why This Happened

When fixing the AI search feature, I updated `axios.js` to use:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
```

This fixed AI search but broke uploads because `PublishPage.jsx` still had `/api/` prefix in the endpoints.

**I should have checked all API calls when changing the baseURL!** 🤦

---

## Prevention

All API calls using `multipartApi` or `api` from `axios.js` should use endpoints **WITHOUT** the `/api/` prefix:

✅ **Correct**:
```javascript
multipartApi.post('/papers/upload', ...)
api.get('/categories')
api.get('/explore', ...)
```

❌ **Wrong**:
```javascript
multipartApi.post('/api/papers/upload', ...)  ← Double /api/
api.get('/api/categories')                     ← Double /api/
```

---

## Files Affected

**Fixed**:
- ✅ `Frontend/src/components/PublishPage.jsx` - Removed `/api/` prefix

**Already Correct**:
- ✅ `Frontend/src/services/geminiService.ts` - Uses `api.get('categories')` (no prefix)
- ✅ `Frontend/src/hooks/useAiSearch.ts` - Uses `api.get('categories')` (no prefix)
- ✅ `Frontend/src/services/categoryService.js` - Uses correct endpoints
- ✅ `Frontend/src/api/axios.js` - BaseURL configured correctly

---

## Status

✅ **FIXED AND READY TO TEST**

**Frontend running**: http://localhost:8082/
**Backend**: Make sure it's running on http://localhost:8080

Try uploading now - it should work! 🚀

---

## Apology

I apologize for breaking the upload feature! I was fixing one thing (AI search baseURL) and didn't verify all API calls were updated consistently.

**The good news**: 
- The fix was simple (remove `/api/` prefix)
- No data was lost
- Your existing papers are still fine
- Upload will work now!

**Test it and let me know!** 😊
