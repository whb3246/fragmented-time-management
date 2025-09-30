# PowerShell script to add environment variables to Vercel
$env_url = "https://vrdwemriegoskonqzwhw.supabase.co"
$env_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZHdlbXJpZWdvc2tvbnF6d2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTMxMTIsImV4cCI6MjA3MzY2OTExMn0.NFWTwR6BDfbjZpvNMAY4249LrnN3FHI0kDENVErNknk"

# Add VITE_SUPABASE_URL
Write-Host "Adding VITE_SUPABASE_URL..."
echo $env_url | vercel env add VITE_SUPABASE_URL production

# Add VITE_SUPABASE_ANON_KEY  
Write-Host "Adding VITE_SUPABASE_ANON_KEY..."
echo $env_key | vercel env add VITE_SUPABASE_ANON_KEY production

Write-Host "Environment variables added successfully!"