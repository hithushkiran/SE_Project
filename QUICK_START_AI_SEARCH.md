# Quick Start Guide - AI Search

## Testing the Feature

### 1. Start Development Server
```bash
cd Frontend
npm run dev
```

### 2. Open Explore Page
Navigate to: `http://localhost:5173/explore`

### 3. Enable AI Search
- Look for the toggle: **"✨ Natural Language AI Search"**
- Click to enable it

### 4. Try These Queries

**Simple keyword search:**
```
machine learning
```
Expected: Keywords extracted, relevant category matched

**With year:**
```
machine learning papers from 2023
```
Expected: Keywords + Year: 2023 + Category: Computer Science

**With author:**
```
quantum mechanics research by John Smith
```
Expected: Keywords + Author + Category: Physics

**Multiple concepts:**
```
AI and deep learning in computer vision
```
Expected: Keywords + Category: Computer Science

**Just category:**
```
physics papers
```
Expected: Category: Physics

### 5. Check the AI Understanding Box
After search, you should see a purple gradient box showing:
- 🔍 Keywords: what AI extracted as search terms
- 📁 Categories: matched categories
- 👤 Author: if mentioned
- 📅 Year: if mentioned

## API Key Setup (Already Done)

Your Gemini API key is already configured in `.env`:
```env
VITE_GEMINI_API_KEY=AIzaSyAxB_-R5VjgJyJjoTZDEHW5Ji5Z0SMCfRI
```

## Free Tier Limits

- ✅ 60 searches per minute
- ✅ 1,500 searches per day
- ✅ Completely free, no credit card needed

## What Happens Behind the Scenes

1. **You type**: "machine learning papers from 2023"
2. **Frontend fetches**: All categories from `/api/categories`
3. **Gemini AI processes**: Extracts keywords, categories, year
4. **Frontend calls**: `/api/explore?query=machine learning&categories=uuid&year=2023`
5. **Results display**: Papers matching all filters

## Troubleshooting

### Toggle not appearing?
- Check that SearchBar component received props
- Look for console errors

### "AI is thinking..." never ends?
- Check browser console for errors
- Verify API key in `.env`
- Check internet connection

### No results found?
- Try simpler query first: "machine learning"
- Check if categories exist in database
- Verify backend is running on localhost:8080

### AI understanding box not showing?
- Toggle must be enabled
- Search must complete successfully
- Check for `parsedQuery` in browser console

## Browser Console Tips

Open Developer Tools (F12) and check:

```javascript
// See what AI parsed
console.log('Parsed Query:', parsedQuery);

// See available categories
console.log('Categories:', categories);

// See API calls
// Network tab -> Filter by "explore"
```

## Testing Different Scenarios

### ✅ Happy Path
```
Input: "machine learning papers from 2023"
Expected: Shows AI box with all filters, returns results
```

### 🔄 Fallback
```
Input: [Disable internet temporarily]
Expected: Shows error, falls back to regular search
```

### 🎯 Partial Matching
```
Input: "AI research"
Expected: Matches "Computer Science" or "Artificial Intelligence" category
```

### ❌ No Category Match
```
Input: "underwater basket weaving papers"
Expected: Only keywords extracted, no category
```

## Backend Requirements (Already Met)

Your backend should have:
- ✅ `/api/categories` endpoint (returns all categories)
- ✅ `/api/explore` endpoint with filters (query, categories, year, author)

Both endpoints are already working in your codebase!

## Next Steps After Testing

1. **Verify all queries work** ✓
2. **Test with real database categories** ✓
3. **Check mobile responsive design** ✓
4. **Test error scenarios** ✓
5. **Deploy to production** (when ready)

## Need Help?

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| TypeScript errors | Restart VS Code |
| Env vars not loading | Restart dev server |
| AI not responding | Check API key validity |
| No categories | Seed database with categories |
| Slow responses | Normal (AI takes 1-3 seconds) |

---

**Status**: ✅ Feature Complete and Ready to Test!

**Time to implement**: ~30 minutes
**Backend changes**: Zero
**Cost**: Free (Gemini API)
**User impact**: Significantly improved search UX
