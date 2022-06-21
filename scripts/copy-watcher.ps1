<#
    For copy watcher
    Copying design-platform/lib
    to
    bluelearn-app -> node_modules
#>

$srcPath = '.\lib'
$destPath = '..\bluelearn-app\node_modules'

$destPlatformPath = $destPath + '\@blue-learn\platform'

Copy-Item $srcPath $destPlatformPath -Recurse -Force

Write-Host "Watcher copy successfull ✅"