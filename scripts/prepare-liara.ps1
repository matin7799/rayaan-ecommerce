# Prepare ZIP files for Liara Docker Deployment
# This script copies the monorepo excluding node_modules, build outputs, and git files,
# injects the correct Dockerfile into the root of each ZIP, and packages them for upload.

$rootDir = (Get-Item .).FullName
$stagingDir = Join-Path $rootDir "temp_staging"

# Recreate staging directory
if (Test-Path $stagingDir) {
    # If the folder exists and is locked, we can try to clean it, but our new copy function will prevent lock issues.
    Remove-Item $stagingDir -Recurse -Force -ErrorAction SilentlyContinue
}

function Copy-ProjectFiles($src, $dest) {
    if (-not (Test-Path $dest)) {
        $null = New-Item -ItemType Directory -Path $dest -Force
    }
    
    $excludeList = @("node_modules", "temp_staging", "*.zip", "*.tar", "*.tar.gz", ".git", ".next", "dist", ".pnpm-store", ".idea", ".vscode", "temp_staging")
    
    Get-ChildItem -Path $src -Force | ForEach-Object {
        $name = $_.Name
        $shouldExclude = $false
        foreach ($pattern in $excludeList) {
            if ($name -like $pattern) { $shouldExclude = $true; break }
        }
        
        if (-not $shouldExclude) {
            $targetPath = Join-Path $dest $name
            if ($_.PsIsContainer) {
                Copy-ProjectFiles $_.FullName $targetPath
            } else {
                Copy-Item -Path $_.FullName -Destination $targetPath -Force
            }
        }
    }
}

function Create-DeploymentZip($appName, $dockerfilePath, $zipName) {
    Write-Host "--------------------------------------------------" -ForegroundColor Cyan
    Write-Host "Preparing deployment package for: $appName" -ForegroundColor Cyan
    Write-Host "--------------------------------------------------" -ForegroundColor Cyan
    
    $stagingAppDir = Join-Path $stagingDir $appName
    
    # 1. Copy project files excluding node_modules, build directories, git and archives
    Write-Host "Copying project files (excluding node_modules and build outputs)..." -ForegroundColor Gray
    Copy-ProjectFiles $rootDir $stagingAppDir
    
    # 2. Inject Dockerfile as root Dockerfile in staging
    $targetDockerfile = Join-Path $rootDir $dockerfilePath
    if (-not (Test-Path $targetDockerfile)) {
        Write-Error "Dockerfile not found at $targetDockerfile"
        return
    }
    Copy-Item -Path $targetDockerfile -Destination (Join-Path $stagingAppDir "Dockerfile") -Force
    
    # 3. Create ZIP archive
    $zipPath = Join-Path $rootDir $zipName
    if (Test-Path $zipPath) {
        Remove-Item $zipPath -Force
    }
    
    Write-Host "Compressing files into $zipName..." -ForegroundColor Yellow
    Compress-Archive -Path (Join-Path $stagingAppDir "*") -DestinationPath $zipPath -Force
    
    Write-Host "Success! Package created: $zipName" -ForegroundColor Green
}

# Create combined package
Create-DeploymentZip -appName "combined" -dockerfilePath "Dockerfile" -zipName "rayaan-deploy.zip"

# Cleanup staging directory
if (Test-Path $stagingDir) {
    Remove-Item $stagingDir -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "Deployment package is ready!" -ForegroundColor Green
Write-Host "1. Upload rayaan-deploy.zip to your Liara App" -ForegroundColor Green
Write-Host "2. Expose the port in your Liara panel settings (port 80)" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
