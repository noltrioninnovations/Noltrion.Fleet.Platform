$baseUrl = "http://localhost:5207"
$loginUrl = "$baseUrl/api/auth-local/login"

try {
    # Login
    $body = @{ username = "admin"; password = "Admin@123" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    $token = $response.data.token
    $headers = @{ Authorization = "Bearer $token" }

    # Fetch Menus
    $menus = Invoke-RestMethod -Uri "$baseUrl/api/menus/my-menus" -Method Get -Headers $headers -ErrorAction Stop
    
    Write-Host "--- Current Menu URLs ---"
    $menus | ForEach-Object { 
        $menuInfo = "$($_.title) : $($_.url)"
        Write-Host $menuInfo
        if ($_.title -eq "Manifest" -and $_.url -eq "/monitoring/trips") {
            Write-Host ">>> CONFIRMED: Manifest -> /monitoring/trips" -ForegroundColor Green
        }
        elseif ($_.title -eq "Job Management" -and $_.url -eq "/jobs") {
            Write-Host ">>> CONFIRMED: Job Management -> /jobs" -ForegroundColor Green
        }
        
        if ($_.children) {
             $_.children | ForEach-Object { Write-Host "  - $($_.title) : $($_.url)" }
        }
    }
    Write-Host "-------------------------"

} catch {
    Write-Host "Error: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Details: $($reader.ReadToEnd())"
    }
}
