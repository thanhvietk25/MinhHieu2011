$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dir = Join-Path $root 'assets\images'
$files = Get-ChildItem -Path $dir -File | Where-Object { $_.Extension -match '^\.(jpe?g|png|webp|gif)$' } | Sort-Object Name
$items = $files | ForEach-Object { "  'assets/images/" + [uri]::EscapeDataString($_.Name) + "'" }
$text = "window.IMAGE_LIST = [`r`n" + ($items -join ",`r`n") + "`r`n];`r`n"
[IO.File]::WriteAllText((Join-Path $root 'js\images.js'), $text, (New-Object Text.UTF8Encoding $false))
Write-Host ("Da cap nhat " + @($files).Count + " anh vao js/images.js")
Read-Host "Nhan Enter de dong"
