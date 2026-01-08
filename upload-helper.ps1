# 🎯 Quick File Upload Helper Script
# PowerShell script to help you upload Nandini's content

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   LinguaLive - Content Upload Helper" -ForegroundColor Yellow
Write-Host "   Nandini Ghosh's Teaching Materials" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Get the project root directory
$projectRoot = $PSScriptRoot
$assetsPath = Join-Path $projectRoot "assets"

Write-Host "Project Location: $projectRoot" -ForegroundColor Green
Write-Host ""

# Function to show folder structure
function Show-UploadLocations {
    Write-Host "📂 UPLOAD LOCATIONS:" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "🎵 VOICE RECORDINGS (MP3, WAV, OGG):" -ForegroundColor Cyan
    Write-Host "   Bengali:  $assetsPath\audio\pronunciation\bengali\" -ForegroundColor White
    Write-Host "   Hindi:    $assetsPath\audio\pronunciation\hindi\" -ForegroundColor White
    Write-Host "   English:  $assetsPath\audio\pronunciation\english\" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📄 PRACTICE PDFs:" -ForegroundColor Cyan
    Write-Host "   Bengali:  $assetsPath\documents\practice-pdfs\bengali\" -ForegroundColor White
    Write-Host "   Hindi:    $assetsPath\documents\practice-pdfs\hindi\" -ForegroundColor White
    Write-Host "   English:  $assetsPath\documents\practice-pdfs\english\" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📝 PRACTICE PROBLEMS:" -ForegroundColor Cyan
    Write-Host "   Bengali:  $assetsPath\documents\practice-problems\bengali\" -ForegroundColor White
    Write-Host "   Hindi:    $assetsPath\documents\practice-problems\hindi\" -ForegroundColor White
    Write-Host "   English:  $assetsPath\documents\practice-problems\english\" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🎥 VIDEO LECTURES (MP4):" -ForegroundColor Cyan
    Write-Host "   Bengali:  $assetsPath\videos\recorded-lectures\bengali\" -ForegroundColor White
    Write-Host "   Hindi:    $assetsPath\videos\recorded-lectures\hindi\" -ForegroundColor White
    Write-Host "   English:  $assetsPath\videos\recorded-lectures\english\" -ForegroundColor White
    Write-Host ""
}

# Function to copy files
function Copy-ContentFiles {
    param (
        [string]$ContentType,
        [string]$Language,
        [string]$SourcePath
    )
    
    $destinationMap = @{
        "audio" = "$assetsPath\audio\pronunciation\$Language"
        "pdf" = "$assetsPath\documents\practice-pdfs\$Language"
        "problems" = "$assetsPath\documents\practice-problems\$Language"
        "video" = "$assetsPath\videos\recorded-lectures\$Language"
    }
    
    $destination = $destinationMap[$ContentType]
    
    if (Test-Path $SourcePath) {
        Write-Host "Copying files from: $SourcePath" -ForegroundColor Yellow
        Write-Host "To: $destination" -ForegroundColor Yellow
        
        Copy-Item "$SourcePath\*" -Destination $destination -Recurse -Force
        
        Write-Host "✅ Files copied successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Source path not found: $SourcePath" -ForegroundColor Red
    }
}

# Function to count uploaded files
function Show-UploadedFiles {
    Write-Host ""
    Write-Host "📊 CURRENT CONTENT STATUS:" -ForegroundColor Yellow
    Write-Host ""
    
    $languages = @("bengali", "hindi", "english")
    
    Write-Host "🎵 Audio Files:" -ForegroundColor Cyan
    foreach ($lang in $languages) {
        $count = (Get-ChildItem "$assetsPath\audio\pronunciation\$lang\*.*" -ErrorAction SilentlyContinue).Count
        Write-Host "   ${lang}: $count files" -ForegroundColor White
    }
    Write-Host ""
    
    Write-Host "📄 PDF Files:" -ForegroundColor Cyan
    foreach ($lang in $languages) {
        $count = (Get-ChildItem "$assetsPath\documents\practice-pdfs\$lang\*.pdf" -ErrorAction SilentlyContinue).Count
        Write-Host "   ${lang}: $count files" -ForegroundColor White
    }
    Write-Host ""
    
    Write-Host "📝 Practice Problems:" -ForegroundColor Cyan
    foreach ($lang in $languages) {
        $count = (Get-ChildItem "$assetsPath\documents\practice-problems\$lang\*.*" -ErrorAction SilentlyContinue).Count
        Write-Host "   ${lang}: $count files" -ForegroundColor White
    }
    Write-Host ""
    
    Write-Host "🎥 Video Files:" -ForegroundColor Cyan
    foreach ($lang in $languages) {
        $count = (Get-ChildItem "$assetsPath\videos\recorded-lectures\$lang\*.mp4" -ErrorAction SilentlyContinue).Count
        Write-Host "   ${lang}: $count files" -ForegroundColor White
    }
    Write-Host ""
}

# Function to open folder in explorer
function Open-UploadFolder {
    param ([string]$FolderType)
    
    $folderPaths = @{
        "1" = "$assetsPath\audio\pronunciation"
        "2" = "$assetsPath\documents\practice-pdfs"
        "3" = "$assetsPath\documents\practice-problems"
        "4" = "$assetsPath\videos\recorded-lectures"
    }
    
    $path = $folderPaths[$FolderType]
    if ($path -and (Test-Path $path)) {
        explorer $path
        Write-Host "✅ Opened folder in Explorer!" -ForegroundColor Green
    }
}

# Main Menu
function Show-Menu {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "           MAIN MENU - Choose Action" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Show Upload Locations" -ForegroundColor White
    Write-Host "2. Show Current Content Status" -ForegroundColor White
    Write-Host "3. Open Audio Folder (Pronunciation)" -ForegroundColor White
    Write-Host "4. Open PDFs Folder (Practice Materials)" -ForegroundColor White
    Write-Host "5. Open Problems Folder (Practice Problems)" -ForegroundColor White
    Write-Host "6. Open Videos Folder (Recorded Lectures)" -ForegroundColor White
    Write-Host "7. Copy Files (Advanced)" -ForegroundColor White
    Write-Host "8. Exit" -ForegroundColor White
    Write-Host ""
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-8)"
    
    switch ($choice) {
        "1" { Show-UploadLocations }
        "2" { Show-UploadedFiles }
        "3" { Open-UploadFolder "1" }
        "4" { Open-UploadFolder "2" }
        "5" { Open-UploadFolder "3" }
        "6" { Open-UploadFolder "4" }
        "7" {
            Write-Host ""
            Write-Host "Content Type:" -ForegroundColor Yellow
            Write-Host "1. Audio (audio)" -ForegroundColor White
            Write-Host "2. PDF (pdf)" -ForegroundColor White
            Write-Host "3. Problems (problems)" -ForegroundColor White
            Write-Host "4. Video (video)" -ForegroundColor White
            $contentType = Read-Host "Enter content type"
            
            Write-Host ""
            Write-Host "Language:" -ForegroundColor Yellow
            Write-Host "1. Bengali" -ForegroundColor White
            Write-Host "2. Hindi" -ForegroundColor White
            Write-Host "3. English" -ForegroundColor White
            $langChoice = Read-Host "Enter language number"
            
            $langMap = @{ "1" = "bengali"; "2" = "hindi"; "3" = "english" }
            $typeMap = @{ "1" = "audio"; "2" = "pdf"; "3" = "problems"; "4" = "video" }
            
            $language = $langMap[$langChoice]
            $type = $typeMap[$contentType]
            
            $sourcePath = Read-Host "Enter source folder path"
            
            Copy-ContentFiles -ContentType $type -Language $language -SourcePath $sourcePath
        }
        "8" {
            Write-Host ""
            Write-Host "Thank you! Upload content and refresh your website to see changes." -ForegroundColor Green
            Write-Host ""
            break
        }
        default {
            Write-Host "Invalid choice. Please try again." -ForegroundColor Red
        }
    }
    
    if ($choice -ne "8") {
        Write-Host ""
        Read-Host "Press Enter to continue"
        Clear-Host
        Write-Host "================================================" -ForegroundColor Cyan
        Write-Host "   LinguaLive - Content Upload Helper" -ForegroundColor Yellow
        Write-Host "================================================" -ForegroundColor Cyan
    }
    
} while ($choice -ne "8")
