$ErrorActionPreference='Stop'
Copy-Item -LiteralPath extension/core.js -Destination public/core.js
New-Item -ItemType Directory -Force -Path public/downloads | Out-Null
Compress-Archive -Path extension/* -DestinationPath public/downloads/hold-my-place.zip -Force
Write-Output 'Packaged extension and shared cue policy.'
