$baseUrl = "http://localhost:5207"
$loginUrl = "$baseUrl/api/auth/login"

try {
    # 1. Login
    $body = @{
        username = "admin"
        password = "password"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    $token = $response.data.token
    $headers = @{ Authorization = "Bearer $token" }

    Write-Host "✅ Login Success"

    # 2. Check Vehicles
    $vehicles = Invoke-RestMethod -Uri "$baseUrl/api/vehicles" -Method Get -Headers $headers -ErrorAction Stop
    $vCount = $vehicles.Count
    if ($vCount -gt 0) { Write-Host "✅ Vehicles API: Found $vCount records" } else { Write-Host "⚠️ Vehicles API: 0 records" }

    # 3. Check Drivers
    $drivers = Invoke-RestMethod -Uri "$baseUrl/api/drivers" -Method Get -Headers $headers -ErrorAction Stop
    $dCount = $drivers.Count
    if ($dCount -gt 0) { Write-Host "✅ Drivers API: Found $dCount records" } else { Write-Host "⚠️ Drivers API: 0 records" }

    # 4. Check Jobs
    $jobs = Invoke-RestMethod -Uri "$baseUrl/api/jobs" -Method Get -Headers $headers -ErrorAction Stop
    $jCount = $jobs.Count
    if ($jCount -gt 0) { Write-Host "✅ Jobs API: Found $jCount records" } else { Write-Host "⚠️ Jobs API: 0 records" }

    # 5. Check Trips (Manifests)
    $trips = Invoke-RestMethod -Uri "$baseUrl/api/monitoring/trips" -Method Get -Headers $headers -ErrorAction Stop
    $tCount = $trips.Count
    if ($tCount -gt 0) { Write-Host "✅ Trips API: Found $tCount records" } else { Write-Host "⚠️ Trips API: 0 records" }

} catch {
    Write-Host "❌ Verification Failed: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Details: $($reader.ReadToEnd())"
    }
}
