# Quick Fix Script - Add Categories to Existing Papers

## Use this PowerShell script to fix papers missing categories

```powershell
# Configuration
$API_BASE = "http://localhost:8080/api"

# Get all categories
Write-Host "📋 Fetching categories..." -ForegroundColor Cyan
$categories = (Invoke-RestMethod -Uri "$API_BASE/categories" -Method GET).data
$categories | ForEach-Object {
    Write-Host "  - $($_.name): $($_.id)" -ForegroundColor White
}

# Get Computer Science category ID
$computerScienceId = ($categories | Where-Object { $_.name -eq "Computer Science" }).id
Write-Host "`n🎯 Computer Science ID: $computerScienceId" -ForegroundColor Green

# Get all papers
Write-Host "`n📄 Fetching all papers..." -ForegroundColor Cyan
$papers = (Invoke-RestMethod -Uri "$API_BASE/papers" -Method GET).data

Write-Host "`n📊 Found $($papers.Count) papers" -ForegroundColor Yellow

# Check each paper for missing categories
$papersWithoutCategories = @()

foreach ($paper in $papers) {
    Write-Host "`nChecking: $($paper.title)" -ForegroundColor Gray
    
    try {
        $paperCategories = (Invoke-RestMethod -Uri "$API_BASE/papers/$($paper.id)/categories" -Method GET).data
        
        if ($paperCategories.Count -eq 0) {
            Write-Host "  ❌ No categories!" -ForegroundColor Red
            $papersWithoutCategories += $paper
        } else {
            $categoryNames = $paperCategories | ForEach-Object { $_.name }
            Write-Host "  ✅ Categories: $($categoryNames -join ', ')" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ⚠️ Error checking categories: $_" -ForegroundColor Yellow
    }
}

# Summary
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "Total papers: $($papers.Count)" -ForegroundColor White
Write-Host "Papers WITH categories: $($papers.Count - $papersWithoutCategories.Count)" -ForegroundColor Green
Write-Host "Papers WITHOUT categories: $($papersWithoutCategories.Count)" -ForegroundColor Red

if ($papersWithoutCategories.Count -gt 0) {
    Write-Host "`n🔧 Papers needing category assignment:" -ForegroundColor Yellow
    
    foreach ($paper in $papersWithoutCategories) {
        Write-Host "`n  📄 $($paper.title)" -ForegroundColor White
        Write-Host "     ID: $($paper.id)" -ForegroundColor Gray
        Write-Host "     Author: $($paper.author)" -ForegroundColor Gray
    }
    
    # Ask if user wants to auto-fix
    Write-Host "`n❓ Do you want to assign 'Computer Science' category to all these papers? (y/n): " -ForegroundColor Yellow -NoNewline
    $response = Read-Host
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "`n🔧 Assigning categories..." -ForegroundColor Cyan
        
        foreach ($paper in $papersWithoutCategories) {
            Write-Host "  Processing: $($paper.title)" -ForegroundColor Gray
            
            try {
                $body = @{
                    categoryIds = @($computerScienceId)
                } | ConvertTo-Json
                
                $result = Invoke-RestMethod `
                    -Uri "$API_BASE/papers/$($paper.id)/categories" `
                    -Method PUT `
                    -Body $body `
                    -ContentType "application/json"
                
                Write-Host "    ✅ Success!" -ForegroundColor Green
            } catch {
                Write-Host "    ❌ Failed: $_" -ForegroundColor Red
            }
        }
        
        Write-Host "`n✅ Done! Papers have been updated." -ForegroundColor Green
    } else {
        Write-Host "`n⏭️ Skipped auto-fix. You can manually assign categories." -ForegroundColor Yellow
    }
} else {
    Write-Host "`n✅ All papers have categories assigned!" -ForegroundColor Green
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
```

---

## How to Use

### Step 1: Save the script
Save the above PowerShell code to a file:
```
c:\Users\User\Desktop\SE_Project\fix-paper-categories.ps1
```

### Step 2: Make sure backend is running
```powershell
cd c:\Users\User\Desktop\SE_Project\backend
mvn spring-boot:run
```

### Step 3: Run the fix script
```powershell
cd c:\Users\User\Desktop\SE_Project
.\fix-paper-categories.ps1
```

---

## What It Does

1. ✅ Fetches all categories from your backend
2. ✅ Fetches all papers
3. ✅ Checks each paper for missing categories
4. ✅ Shows a summary of papers without categories
5. ✅ Asks if you want to auto-assign "Computer Science" to all papers without categories
6. ✅ Fixes the papers if you confirm

---

## Example Output

```
📋 Fetching categories...
  - Computer Science: 4c3774b0-c3f2-4cbc-8b2a-368a804d9ace
  - Physics: a1b2c3d4-e5f6-4789-0abc-def123456789
  - Biology: ...

🎯 Computer Science ID: 4c3774b0-c3f2-4cbc-8b2a-368a804d9ace

📄 Fetching all papers...

📊 Found 27 papers

Checking: Advanced Machine Learning Techniques
  ❌ No categories!

Checking: Quantum Computing Research
  ✅ Categories: Physics

============================================================
📊 Summary:
============================================================
Total papers: 27
Papers WITH categories: 15
Papers WITHOUT categories: 12

🔧 Papers needing category assignment:

  📄 Advanced Machine Learning Techniques
     ID: 767aae8b-4278-446c-9722-bddc5977f6e4
     Author: Dr. Smith

  📄 Computer Vision Basics
     ID: 42fa4d79-6999-4b62-a08f-f67845f47f74
     Author: Prof. Jones

❓ Do you want to assign 'Computer Science' category to all these papers? (y/n): y

🔧 Assigning categories...
  Processing: Advanced Machine Learning Techniques
    ✅ Success!
  Processing: Computer Vision Basics
    ✅ Success!

✅ Done! Papers have been updated.
```

---

## Manual Fix (Alternative)

If you prefer to manually assign specific categories to specific papers:

```powershell
# Get paper ID by searching for title
$papers = (Invoke-RestMethod -Uri "http://localhost:8080/api/papers").data
$myPaper = $papers | Where-Object { $_.title -like "*computer vision*" }
$myPaper.id

# Assign category to that paper
$body = @{
    categoryIds = @("4c3774b0-c3f2-4cbc-8b2a-368a804d9ace")
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:8080/api/papers/$($myPaper.id)/categories" `
    -Method PUT `
    -Body $body `
    -ContentType "application/json"
```

---

## After Fix - Test AI Search

Once papers have categories assigned, test AI search:

```
Query: "computer vision"

Expected Results:
✅ Gemini parses: { categories: ["Computer Science"], keywords: "computer vision" }
✅ Backend finds papers with Computer Science category
✅ Papers displayed: 1+ results
✅ Paper details show "Computer Science" category
```

---

## Verification Query

Run this in your database after the fix:

```sql
SELECT 
    p.title,
    GROUP_CONCAT(c.name SEPARATOR ', ') as categories
FROM papers p
LEFT JOIN paper_categories pc ON p.id = pc.paper_id
LEFT JOIN categories c ON pc.category_id = c.id
WHERE p.title LIKE '%vision%'
GROUP BY p.id, p.title;
```

Should show:
```
title: "Computer Vision Paper"
categories: "Computer Science"   ← Fixed!
```

---

## Root Cause Prevention

After fixing existing papers, prevent future issues by ensuring:

1. **Upload form sends categoryIds**: Check `PublishPage.jsx` line 120-135
2. **Backend logs confirm receipt**: Check console for "CategoryIds received: [...]"
3. **Always use `/upload-with-categories` endpoint** when categories are selected
