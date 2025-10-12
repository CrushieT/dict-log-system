# Load environment variables from .env
Get-Content .env | ForEach-Object {
    # Skip empty lines and comments
    if ($_ -and $_ -notmatch '^\s*#') {
        $pair = $_ -split "="
        if ($pair.Length -eq 2) {
            $name = $pair[0].Trim()
            $value = $pair[1].Trim()
            # Set environment variable for current session
            Set-Item -Path "Env:$name" -Value $value
        }
    }
}
Write-Host "Environment variables loaded."
