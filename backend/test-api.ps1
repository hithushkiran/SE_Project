# Simple API test script
Write-Host "Testing ResearchHub API..." -ForegroundColor Green

# Test categories
Write-Host "`n1. Testing categories endpoint..." -ForegroundColor Cyan
try {
    $categories = Invoke-RestMethod -Uri "http://localhost:8080/api/categories" -Method GET
    Write-Host "✅ Categories: $($categories.data.Count) categories loaded" -ForegroundColor Green
} catch {
    Write-Host "❌ Categories failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test explore endpoint
Write-Host "`n2. Testing explore endpoint..." -ForegroundColor Cyan
try {
    $explore = Invoke-RestMethod -Uri "http://localhost:8080/api/explore?page=0&size=5" -Method GET
    Write-Host "✅ Explore: $($explore.data.content.Count) papers returned" -ForegroundColor Green
} catch {
    Write-Host "❌ Explore failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
}

# Test search
Write-Host "`n3. Testing search..." -ForegroundColor Cyan
try {
    $search = Invoke-RestMethod -Uri "http://localhost:8080/api/explore?query=machine%20learning&page=0&size=3" -Method GET
    Write-Host "✅ Search: $($search.data.content.Count) papers found for 'machine learning'" -ForegroundColor Green
} catch {
    Write-Host "❌ Search failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 API testing complete!" -ForegroundColor Green
Write-Host "Frontend should now work at http://localhost:5174" -ForegroundColor Yellow
