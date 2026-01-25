$baseUrl = "http://localhost:5207"
$loginUrl = "$baseUrl/api/auth/login"

try {
    # Login
    $body = @{ username = "admin"; password = "password" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    $token = $response.data.token
    $headers = @{ Authorization = "Bearer $token" }

    # Fetch Roles (Assuming generic GET endpoint or using user-roles)
    # If no direct role endpoint, I'll try to guess or just use what I have.
    # Framework usually has /api/roles?
    
    try {
        $roles = Invoke-RestMethod -Uri "$baseUrl/api/roles" -Method Get -Headers $headers -ErrorAction Stop
        Write-Host "--- Roles ---"
        $roles.data | ForEach-Object { 
            Write-Host "$($_.id) | $($_.code) | $($_.name)"
        }
    } catch {
        Write-Host "Could not fetch roles from /api/roles. Trying endpoint discovery or assuming DB query needed."
        Write-Host $_
    }

} catch {
    Write-Host "Login Failed: $_"
}
