<# 
    Script for copying lib folder from 
    bluelearn/design-platform 
    to
    bluelearn/bluelearn-app 
#>


$srcPath = '.\lib'
$destPath = '..\bluelearn-app\node_modules'

$destPlatformPath = $destPath + '\@blue-learn\platform\lib'

if(Test-Path $destPlatformPath){
    Remove-Item $destPlatformPath -Recurse -Force
    Write-Host "Platform file deleted successfully ✅"
}
else {
    Write-Host "Platform Doesn't Exists"
}

Write-Host "Copying platform files..."

Copy-Item $srcPath $destPlatformPath -Recurse

Write-Host "Copied successfully ✅"