# Set environment variables permanently
[System.Environment]::SetEnvironmentVariable('TEMP', 'G:\micro3\temp', [System.EnvironmentVariableTarget]::User)
[System.Environment]::SetEnvironmentVariable('TMP', 'G:\micro3\temp', [System.EnvironmentVariableTarget]::User)
[System.Environment]::SetEnvironmentVariable('CARGO_TARGET_DIR', 'G:\micro3\target', [System.EnvironmentVariableTarget]::User)

# Create directories if they don't exist
New-Item -ItemType Directory -Force -Path "G:\micro3\temp"
New-Item -ItemType Directory -Force -Path "G:\micro3\target"

Write-Host "Temporary directory has been set to G:\micro3\temp"
Write-Host "Cargo target directory has been set to G:\micro3\target"
Write-Host "Please restart your terminal for changes to take effect" 