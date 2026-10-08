#requires -Version 7.0
param([switch]$ValidationOnly)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if (-not $IsWindows) { throw 'Microsoft Store packaging needs Windows and the Windows SDK.' }
$arguments = @('--experimental-strip-types', (Join-Path $PSScriptRoot 'prepare-store.mjs'))
if ($ValidationOnly) { $arguments += '--validation-only' }
$prepared = & node @arguments
if ($LASTEXITCODE -ne 0) { throw 'Store staging failed; no package will be produced.' }
$data = ($prepared -join "`n") | ConvertFrom-Json
$sdkRoot = Join-Path ${env:ProgramFiles(x86)} 'Windows Kits/10/bin'
$sdk = Get-ChildItem -LiteralPath $sdkRoot -Directory |
  Where-Object { $_.Name -match '^10\.0\.\d+\.\d+$' -and (Test-Path (Join-Path $_.FullName 'x64/makeappx.exe')) } |
  Sort-Object { [Version]$_.Name } -Descending | Select-Object -First 1
if (-not $sdk) { throw 'Install the Windows 10/11 SDK with MakeAppx before packaging.' }
$makeappx = Join-Path $sdk.FullName 'x64/makeappx.exe'
# Keep the SDK's schema, file and resource validation enabled; never use /nv.
& $makeappx pack /d $data.staging /p $data.packagePath /h SHA256 /o
if ($LASTEXITCODE -ne 0) { throw 'MakeAppx rejected the package.' }
$unpacked = Join-Path (Split-Path $data.packagePath) ('unpacked-' + [Guid]::NewGuid().ToString('N'))
& $makeappx unpack /p $data.packagePath /d $unpacked /o
if ($LASTEXITCODE -ne 0) { throw 'The produced MSIX cannot be unpacked.' }
foreach ($file in Get-ChildItem -LiteralPath $data.staging -File -Recurse) {
  $relative = [IO.Path]::GetRelativePath($data.staging, $file.FullName)
  $extracted = Join-Path $unpacked $relative
  if (-not (Test-Path -LiteralPath $extracted) -or (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash -ne (Get-FileHash -LiteralPath $extracted -Algorithm SHA256).Hash) { throw "MSIX round-trip mismatch: $relative" }
}
[xml]$manifest = Get-Content -LiteralPath (Join-Path $unpacked 'AppxManifest.xml') -Raw
if ($manifest.Package.Identity.Name -cne $data.identity.name -or $manifest.Package.Identity.Publisher -cne $data.identity.publisher -or $manifest.Package.Identity.Version -cne $data.identity.version -or $manifest.Package.Identity.ProcessorArchitecture -cne 'x64') { throw 'Packaged identity changed during MSIX generation.' }
if (Test-Path -LiteralPath (Join-Path $unpacked 'AppxSignature.p7x')) { throw 'Unexpected signature in an unsigned Store submission package.' }
$hash = (Get-FileHash -LiteralPath $data.packagePath -Algorithm SHA256).Hash.ToLowerInvariant()
$sum = "$hash  $([IO.Path]::GetFileName($data.packagePath))`n"
[IO.File]::WriteAllText((Join-Path (Split-Path $data.packagePath) 'SHA256SUMS.txt'), $sum, [Text.UTF8Encoding]::new($false))
if ($ValidationOnly) { Write-Host 'VALIDATION ONLY: MSIX packed/unpacked successfully; this fixture is not a consumer download or a Store submission.' }
else { Write-Host 'Store submission MSIX packed and verified. Upload to Partner Center for Microsoft certification/signing; do not distribute this unsigned package to users.' }
