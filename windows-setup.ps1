# Version: ###DATE###
# irm zez.dev | iex

echo ""
echo "   _____             _          _       ___           __                      _____      __            "
echo "  /__  /  ___  ____ ( )_____   | |     / (_)___  ____/ /___ _      _______   / ___/___  / /___  ______ "
echo "    / /  / _ \/_  / |// ___/   | | /| / / / __ \/ __  / __ \ | /| / / ___/   \__ \/ _ \/ __/ / / / __ \"
echo "   / /__/  __/ / /_  (__  )    | |/ |/ / / / / / /_/ / /_/ / |/ |/ (__  )   ___/ /  __/ /_/ /_/ / /_/ /"
echo "  /____/\___/ /___/ /____/     |__/|__/_/_/ /_/\__,_/\____/|__/|__/____/   /____/\___/\__/\__,_/ .___/ "
echo "                                                                                              /_/      "
echo ""

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true

# In the registry, those values are stored in little endian
function rgbToAABBGGRR {
    param (
        [int[]]$rgb
    )
    return '00{0:X2}{1:X2}{2:X2}' -f $rgb[2], $rgb[1], $rgb[0]
}

$Color0 = 24, 24, 24 #30 - black
$Color1 = 73, 137, 226 #34 - blue
$Color2 = 64, 199, 61 #32 - green
$Color3 = 17, 168, 205 #36 - cyan
$Color4 = 205, 49, 49 #31 - red
$Color5 = 188, 63, 188 #35 - magenta
$Color6 = 229, 229, 16 #33 - yellow
$Color7 = 220, 220, 220 #37 - white
$Color8 = 102, 102, 102 #90 - bright black (gray)
$Color9 = 74, 152, 245 #94 - bright blue
$Color10 = 70, 206, 70 #92 - bright green
$Color11 = 41, 184, 219 #96 - bright cyan
$Color12 = 241, 76, 76 #93 - bright red
$Color13 = 214, 112, 214 #95 - bright magenta
$Color14 = 245, 245, 67 #91 - bright yellow
$Color15 = 242, 242, 242 #97 - bright white

$colors = @(
    $Color0, $Color1, $Color2, $Color3, $Color4, $Color5, $Color6, $Color7,
    $Color8, $Color9, $Color10, $Color11, $Color12, $Color13, $Color14, $Color15
)


$regPaths = @(
    "HKCU:\Console",
    "HKCU:\Console\%SystemRoot%_system32_cmd.exe",
    "HKCU:\Console\%SystemRoot%_System32_WindowsPowerShell_v1.0_powershell.exe",
    "HKCU:\Console\%SystemRoot%_SysWOW64_WindowsPowerShell_v1.0_powershell.exe"
    #Those two don't work
    #"HKCU:\Console\%SystemRoot%_System32_WindowsPowerShell_v1.0_powershell_ise.exe",
    #"HKCU:\Console\%SystemRoot%_SysWOW64_WindowsPowerShell_v1.0_powershell_ise.exe"
)

foreach ($regPath in $regPaths) {
    if (-not (Test-Path -Path $regPath)) {
        echo ("Creating registry path: {0}" -f $regPath)
        New-Item -Path $regPath -Force | Out-Null
    }
    echo "Setting registry keys for $regPath"
    echo "Setting color properties"
    for ($i = 0; $i -lt $colors.Count; $i++) {
        $colorValue = rgbToAABBGGRR $colors[$i]
        $colorValue = + "0x$colorValue"
        $regKey = "ColorTable{0:d2}" -f $i
        #echo ("Setting $regKey to {0:x}" -f $colorValue)

        Set-ItemProperty -Path $regPath -Name $regKey -Value $colorValue
    }

    echo ("Setting additional properties")
    Set-ItemProperty -Path $regPath -Name "ScreenColors" -Value 0x00000007 # black on white
    Set-ItemProperty -Path $regPath -Name "PopupColors" -Value 0x00000007 # black on white
    Set-ItemProperty -Path $regPath -Name "FaceName" -Value "Consolas"
    Set-ItemProperty -Path $regPath -Name "FontFamily" -Value 0x00000036 # Consolas
    Set-ItemProperty -Path $regPath -Name "FontWeight" -Value 0x00000190 # 400
    Set-ItemProperty -Path $regPath -Name "FontSize" -Value 0x00100000 # 16px
    Set-ItemProperty -Path $regPath -Name "HistoryBufferSize" -Value 999
    Set-ItemProperty -Path $regPath -Name "HistoryNoDup" -Value 1
}

# Prompt for CMD. Can't do much with it unfortunately other than setting color and adding a space after ">"
echo "Setting cmd prompt environment variable"
Set-ItemProperty -Path "HKCU:\Environment" -Name "PROMPT" -Value '$e[92m$p$e[0m$g '


function patchShortcut {
    param (
        [string]$shortcutPath,
        [string]$shortcutContentBase64,
        [int]$colorOffset
    )

    $shortcutContent = [System.Convert]::FromBase64String($shortcutContentBase64)
    if (-not (Test-Path -Path $shortcutPath)) {
        echo ("Creating shortcut at {0}" -f $shortcutPath)
        New-Item -Path $shortcutPath -ItemType File -Force | Out-Null
    }

    for ($i = 0; $i -lt $colors.Count; $i++) {
        $offset = $colorOffset + ($i * 4) + 1 # +1 for the first byte which is always 0
        $colors[$i] | ForEach-Object { $shortcutContent[$offset++] = $_ }
    }

    Set-Content -Path $shortcutPath -Value $shortcutContent -Encoding Byte
}

echo "Patching powershell shortcut"

patchShortcut "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Windows PowerShell\Windows PowerShell.lnk" `
    "TAAAAAEUAgAAAAAAwAAAAAAAAEbfAgAAIAAAAJuvlrfNas0Bm6+Wt81qzQGAHQKo3WrNAQDwBgAA
AAAAAQAAAAAAAAAAAAAAAAAAAPEBFAAfUOBP0CDqOmkQotgIACswMJ0ZAC9DOlwAAAAAAAAAAAAA
AAAAAAAAAAAAUgAxAAAAAADHQgKwMABXaW5kb3dzADwACAAEAO+++kDALMdCArAqAAAAHxAAAAAA
AQAAAAAAAAAAAAAAAAAAAFcAaQBuAGQAbwB3AHMAAAAWAFYAMQAAAAAAx0JdBTAAU3lzdGVtMzIA
AD4ACAAEAO+++kDBLMdCXQUqAAAAChgAAAAAAQAAAAAAAAAAAAAAAAAAAFMAeQBzAHQAZQBtADMA
MgAAABgAaAAxAAAAAAD6QKBBEABXSU5ET1d+MQAAUAAIAAQA7776QKBB+kCgQSoAAACHHQAAAAAB
AAAAAAAAAAAAAAAAAAAAVwBpAG4AZABvAHcAcwBQAG8AdwBlAHIAUwBoAGUAbABsAAAAGABKADEA
AAAAALhC660UAHYxLjAAADYACAAEAO+++kCgQbhC660qAAAAiB0AAAAAAQAAAAAAAAAAAAAAAAAA
AHYAMQAuADAAAAAUAGgAMgAA8AYA+kCaGiAAcG93ZXJzaGVsbC5leGUAAEoACAAEAO+++kBXC/pA
VwsqAAAA//kAAAAAAQAAAAAAAAAAAAAAAAAAAHAAbwB3AGUAcgBzAGgAZQBsAGwALgBlAHgAZQAA
AB4AAABuAAAAHAAAAAEAAAAcAAAAMwAAAAAAAABtAAAAFwAAAAMAAABzLe50EAAAAE9TRGlzawBD
OlxXaW5kb3dzXFN5c3RlbTMyXFdpbmRvd3NQb3dlclNoZWxsXHYxLjBccG93ZXJzaGVsbC5leGUA
AC4AUABlAHIAZgBvAHIAbQBzACAAbwBiAGoAZQBjAHQALQBiAGEAcwBlAGQAIAAoAGMAbwBtAG0A
YQBuAGQALQBsAGkAbgBlACkAIABmAHUAbgBjAHQAaQBvAG4AcwBRAC4ALgBcAC4ALgBcAC4ALgBc
AC4ALgBcAC4ALgBcAC4ALgBcAC4ALgBcAC4ALgBcAC4ALgBcAFcAaQBuAGQAbwB3AHMAXABTAHkA
cwB0AGUAbQAzADIAXABXAGkAbgBkAG8AdwBzAFAAbwB3AGUAcgBTAGgAZQBsAGwAXAB2ADEALgAw
AFwAcABvAHcAZQByAHMAaABlAGwAbAAuAGUAeABlABUAJQBIAE8ATQBFAEQAUgBJAFYARQAlACUA
SABPAE0ARQBQAEEAVABIACUAOwAlAFMAeQBzAHQAZQBtAFIAbwBvAHQAJQBcAHMAeQBzAHQAZQBt
ADMAMgBcAFcAaQBuAGQAbwB3AHMAUABvAHcAZQByAFMAaABlAGwAbABcAHYAMQAuADAAXABwAG8A
dwBlAHIAcwBoAGUAbABsAC4AZQB4AGUAFAMAAAEAAKAlU3lzdGVtUm9vdCVcc3lzdGVtMzJcV2lu
ZG93c1Bvd2VyU2hlbGxcdjEuMFxwb3dlcnNoZWxsLmV4ZQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAACUAUwB5AHMAdABlAG0AUgBvAG8AdAAlAFwAcwB5AHMAdABlAG0AMwAyAFwAVwBpAG4A
ZABvAHcAcwBQAG8AdwBlAHIAUwBoAGUAbABsAFwAdgAxAC4AMABcAHAAbwB3AGUAcgBzAGgAZQBs
AGwALgBlAHgAZQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAQAAAABQAAoCUAAADVAAAAHAAAAAsAAKB3TsEa5wJdTrdELrGuUZi31QAA
AGAAAAADAACgWAAAAAAAAABsZWVob2xtMTYAAAAAAAAAmpqyu7ZVLUqI6zLq13xnQNkHI1xpM+IR
vnAAHMQt9AuamrK7tlUtSojrMurXfGdA2QcjXGkz4hG+cAAcxC30C8wAAAACAACgBwDzAHgAuAt4
ADIAgAJ/AAAAAAAAAAAACAAQADYAAACQAQAAQwBvAG4AcwBvAGwAYQBzAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkAAAAAAAAAAQAAAAEAAAABAAAA5wMA
AAQAAAABAAAABAUGAAAAgAAAgAAAAICAAIAAAAABJFYA7u3wAMDAwACAgIAAAAD/AAD8AAAA//8A
yQAAAAAAAAD//wAA//79ADABAAAJAACgkQAAADFTUFPiilhGvEw4Q7v8E5MmmG3OdQAAAAQAAAAA
HwAAADIAAABTAC0AMQAtADUALQAyADEALQAyADcAMgA3ADUAMgAxADEAOAA0AC0AMQA2ADAANAAw
ADEAMgA3ADIAMAAtADEAOAA4ADcAOQAyADcANQAyADcALQAxADEAOAAwADYANAAzAAAAAAAAAJMA
AAAxU1BTBwZXDJYD3kOdYeMh199QJhEAAAADAAAAAAsAAAD//wAAEQAAAAEAAAAACwAAAP//AAAR
AAAAAgAAAAALAAAA//8AABEAAAAEAAAAAAsAAAAAAAAAEQAAAAYAAAAAAgAAAP8AAAARAAAABQAA
AAALAAAA//8AABEAAAAKAAAAAAsAAAAAAAAAAAAAAAAAAAAAAAAA" 0x87E

echo "Patching powershell x86 shortcut"
patchShortcut "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Windows PowerShell\Windows PowerShell (x86).lnk" `
    "TAAAAAEUAgAAAAAAwAAAAAAAAEbfAgAAIAAAAJuvlrfNas0Bm6+Wt81qzQGAHQKo3WrNAQDwBgAA
AAAAAQAAAAAAAAAAAAAAAAAAAPEBFAAfUOBP0CDqOmkQotgIACswMJ0ZAC9DOlwAAAAAAAAAAAAA
AAAAAAAAAAAAUgAxAAAAAADHQgKwMABXaW5kb3dzADwACAAEAO+++kDALMdCArAqAAAAHxAAAAAA
AQAAAAAAAAAAAAAAAAAAAFcAaQBuAGQAbwB3AHMAAAAWAFYAMQAAAAAAuELmrRAAU3lzV09XNjQA
AD4ACAAEAO+++kDBLLhC5q0qAAAAiRwAAAAAAQAAAAAAAAAAAAAAAAAAAFMAeQBzAFcATwBXADYA
NAAAABgAaAAxAAAAAAD6QKBBEABXSU5ET1d+MQAAUAAIAAQA7776QKBB+kCgQSoAAACHHQAAAAAB
AAAAAAAAAAAAAAAAAAAAVwBpAG4AZABvAHcAcwBQAG8AdwBlAHIAUwBoAGUAbABsAAAAGABKADEA
AAAAALhC660UAHYxLjAAADYACAAEAO+++kCgQbhC660qAAAAiB0AAAAAAQAAAAAAAAAAAAAAAAAA
AHYAMQAuADAAAAAUAGgAMgAA8AYA+kCaGiAAcG93ZXJzaGVsbC5leGUAAEoACAAEAO+++kBXC/pA
VwsqAAAA//kAAAAAAQAAAAAAAAAAAAAAAAAAAHAAbwB3AGUAcgBzAGgAZQBsAGwALgBlAHgAZQAA
AB4AAABuAAAAHAAAAAEAAAAcAAAAMwAAAAAAAABtAAAAFwAAAAMAAABzLe50EAAAAE9TRGlzawBD
OlxXaW5kb3dzXFN5c1dPVzY0XFdpbmRvd3NQb3dlclNoZWxsXHYxLjBccG93ZXJzaGVsbC5leGUA
AC4AUABlAHIAZgBvAHIAbQBzACAAbwBiAGoAZQBjAHQALQBiAGEAcwBlAGQAIAAoAGMAbwBtAG0A
YQBuAGQALQBsAGkAbgBlACkAIABmAHUAbgBjAHQAaQBvAG4AcwBRAC4ALgBcAC4ALgBcAC4ALgBc
AC4ALgBcAC4ALgBcAC4ALgBcAC4ALgBcAC4ALgBcAC4ALgBcAFcAaQBuAGQAbwB3AHMAXABTAHkA
cwBXAE8AVwA2ADQAXABXAGkAbgBkAG8AdwBzAFAAbwB3AGUAcgBTAGgAZQBsAGwAXAB2ADEALgAw
AFwAcABvAHcAZQByAHMAaABlAGwAbAAuAGUAeABlABUAJQBIAE8ATQBFAEQAUgBJAFYARQAlACUA
SABPAE0ARQBQAEEAVABIACUAOwAlAFMAeQBzAHQAZQBtAFIAbwBvAHQAJQBcAHMAeQBzAHcAbwB3
ADYANABcAFcAaQBuAGQAbwB3AHMAUABvAHcAZQByAFMAaABlAGwAbABcAHYAMQAuADAAXABwAG8A
dwBlAHIAcwBoAGUAbABsAC4AZQB4AGUAFAMAAAEAAKAlU3lzdGVtUm9vdCVcc3lzd293NjRcV2lu
ZG93c1Bvd2VyU2hlbGxcdjEuMFxwb3dlcnNoZWxsLmV4ZQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAACUAUwB5AHMAdABlAG0AUgBvAG8AdAAlAFwAcwB5AHMAdwBvAHcANgA0AFwAVwBpAG4A
ZABvAHcAcwBQAG8AdwBlAHIAUwBoAGUAbABsAFwAdgAxAC4AMABcAHAAbwB3AGUAcgBzAGgAZQBs
AGwALgBlAHgAZQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAQAAAABQAAoCkAAADVAAAAHAAAAAsAAKCwMVLW8bJXSKTOqOfG6n0n1QAA
AGAAAAADAACgWAAAAAAAAABsZWVob2xtMTYAAAAAAAAAmpqyu7ZVLUqI6zLq13xnQNkHI1xpM+IR
vnAAHMQt9AuamrK7tlUtSojrMurXfGdA2QcjXGkz4hG+cAAcxC30C8wAAAACAACgBwDzAHgAuAt4
ADIA0ADQAAAAAAAAAAAACAAQADYAAACQAQAAQwBvAG4AcwBvAGwAYQBzAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkAAAAAAAAAAQAAAAEAAAABAAAA5wMA
AAQAAAAAAAAABAUGAAAAgAAAgAAAAICAAIAAAAABJFYA7u3wAMDAwACAgIAAAAD/AAD/AAAA//8A
/wAAAP8A/wD//wAA////ADABAAAJAACgkQAAADFTUFPiilhGvEw4Q7v8E5MmmG3OdQAAAAQAAAAA
HwAAADIAAABTAC0AMQAtADUALQAyADEALQAyADEAMgA3ADUAMgAxADEAOAA0AC0AMQA2ADAANAAw
ADEAMgA5ADIAMAAtADEAOAA4ADcAOQAyADcANQAyADcALQAxADEAOAAwADYANAAzAAAAAAAAAJMA
AAAxU1BTBwZXDJYD3kOdYeMh199QJhEAAAADAAAAAAsAAAD//wAAEQAAAAEAAAAACwAAAP//AAAR
AAAAAgAAAAALAAAA//8AABEAAAAEAAAAAAsAAAAAAAAAEQAAAAYAAAAAAgAAAP8AAAARAAAABQAA
AAALAAAA//8AABEAAAAKAAAAAAsAAAAAAAAAAAAAAAAAAAAAAAAA" 0x87E

echo "Patching cmd shortcut"

patchShortcut "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\System Tools\Command Prompt.lnk" `
    "TAAAAAEUAgAAAAAAwAAAAAAAAEbcAwACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAQAAAAAAAAAAAAAAAAAAACUAQAAlAHcAaQBuAGQAaQByACUAXABzAHkAcwB0AGUAbQAzADIA
XABzAGgAZQBsAGwAMwAyAC4AZABsAGwALAAtADIAMgA1ADMANAAzAC4ALgBcAC4ALgBcAC4ALgBc
AC4ALgBcAC4ALgBcAC4ALgBcAC4ALgBcAC4ALgBcAC4ALgBcAFcASQBOAEQATwBXAFMAXABzAHkA
cwB0AGUAbQAzADIAXABjAG0AZAAuAGUAeABlABUAJQBIAE8ATQBFAEQAUgBJAFYARQAlACUASABP
AE0ARQBQAEEAVABIACUAGQAlAHcAaQBuAGQAaQByACUAXABzAHkAcwB0AGUAbQAzADIAXABjAG0A
ZAAuAGUAeABlABQDAAABAACgJXdpbmRpciVcc3lzdGVtMzJcY21kLmV4ZQAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlAHcAaQBu
AGQAaQByACUAXABzAHkAcwB0AGUAbQAzADIAXABjAG0AZAAuAGUAeABlAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
zAAAAAIAAKAHAAUAeAApI3gAHgDqAOoAAAAAAAAAAAAAABAANgAAAJABAABDAG8AbgBzAG8AbABh
AHMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGQAAAAAA
AAABAAAAAQAAAAEAAADnAwAABAAAAAAAAAAEBQYAAACAAACAAAAAgIAAgAAAAIAAgACAgAAAwMDA
AICAgAAAAP8AAP8AAAD//wD/AAAA/wD/AP//AAD///8A+QAAAAkAAKCTAAAAMVNQUwcGVwyWA95D
nWHjIdffUCYRAAAAAwAAAAALAAAA//8AABEAAAABAAAAAAsAAAD//wAAEQAAAAIAAAAACwAAAP//
AAARAAAABAAAAAALAAAAAAAAABEAAAAGAAAAAAIAAAD/AAAAEQAAAAUAAAAACwAAAP//AAARAAAA
CgAAAAALAAAAAAAAAAAAAAAtAAAAMVNQU1UoTJ95nzlLqNDh1C3h1fMRAAAAEgAAAAATAAAAAQAA
AAAAAAAtAAAAMVNQU+KKWEa8TDhDu/wTkyaYbc4RAAAAAAAAAAATAAAAAAAAAAAAAAAAAAAAAAAA
AA==" 0x49F

echo "Setting powershell profile"
$profilePath = "$env:USERPROFILE\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1"
if (-not (Test-Path -Path $profilePath)) {
    echo ("Creating PowerShell profile at {0}" -f $profilePath)
    New-Item -Path $profilePath -ItemType File -Force | Out-Null
}

$profileContent = @'
#https://www.it-connect.fr/comment-personnaliser-le-prompt-de-son-environnement-powershell/
#https://github.com/tbaheux/itconnect/blob/master/profile.ps1

#Last modified: ###DATE###

function prompt {
    $isAdmin = (New-Object Security.Principal.WindowsPrincipal ([Security.Principal.WindowsIdentity]::GetCurrent())).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
    $adminPrompt = if ($isAdmin) { "[Admin] " } else { "" }
    $currentPath = (Get-Location).Path

    #feels too weird
    #$currentPath = $currentPath -replace [regex]::Escape($env:USERPROFILE), '~'

    try {
        $gitBranch = (git rev-parse --abbrev-ref HEAD 2>$null)
        if ($gitBranch -eq "master" -or $gitBranch -eq "main") {
            $gitBranch = ""
        }
    } catch {
        $gitBranch = ""
    }
    $host.UI.RawUI.WindowTitle = "$adminPrompt$currentPath$(if ($gitBranch) { " ($gitBranch)" } else { '' }) - Powershell"
    Write-Host $adminPrompt -NoNewline -ForegroundColor Red
    Write-Host "PS " -NoNewline -ForegroundColor Green
    Write-Host "$currentPath" -NoNewline -ForegroundColor Cyan
    if ($gitBranch) {
        Write-Host " $gitBranch" -NoNewline -ForegroundColor Magenta
    }
    #It seems it is not possible to accurately detect if the last command failed
    #if ($? -eq $false) {
    #    Write-Host ">" -NoNewline -ForegroundColor Red
    #} else {
    #    Write-Host ">" -NoNewline -ForegroundColor White
    #}
    return "> "
}
'@

[IO.File]::WriteAllText($profilePath, $profileContent)

echo "Setting .bashrc for current/future git bash"
$bashrcPath = "$env:USERPROFILE\.bashrc"
$bashrc = @'
###BASHRC###
'@

[IO.File]::WriteAllText($bashrcPath, $bashrc)

#todo: set default file extensions, notably for empty extensions and also check for ps1

#also display file extensions + system files

echo "Setting explorer to display hidden files"
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "Hidden" -Value 1
echo "Setting explorer to display file extensions"
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "HideFileExt" -Value 0
echo "Setting explorer to display system files"
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "ShowSuperHidden" -Value 1

#Code from https://github.com/DanysysTeam/PS-SFTA/blob/master/SFTA.ps1
#Defeats the UserChoice hash and allows setting file type associations


function Get-UserExperience {
    [OutputType([string])]
    $hardcodedExperience = "User Choice set via Windows User Experience {D18B6DD5-6124-4341-9318-804003BAFA0B}"
    $userExperienceSearch = "User Choice set via Windows User Experience"
    $userExperienceString = ""
    $user32Path = [Environment]::GetFolderPath([Environment+SpecialFolder]::SystemX86) + "\Shell32.dll"
    $fileStream = [System.IO.File]::Open($user32Path, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
    $binaryReader = New-Object System.IO.BinaryReader($fileStream)
    [Byte[]] $bytesData = $binaryReader.ReadBytes(5mb)
    $fileStream.Close()
    $dataString = [Text.Encoding]::Unicode.GetString($bytesData)
    $position1 = $dataString.IndexOf($userExperienceSearch)
    $position2 = $dataString.IndexOf("}", $position1)
    try {
        $userExperienceString = $dataString.Substring($position1, $position2 - $position1 + 1)
    } catch {
        $userExperienceString = $hardcodedExperience
    }
    Write-Output $userExperienceString
}

$userExperience = Get-UserExperience


$code = '
using System;
using System.Runtime.InteropServices;
using Microsoft.Win32;

namespace Registry {
    public class Utils {
        [DllImport("advapi32.dll", SetLastError = true)]
        private static extern int RegOpenKeyEx(UIntPtr hKey, string subKey, int ulOptions, int samDesired, out UIntPtr hkResult);

        [DllImport("advapi32.dll", SetLastError=true, CharSet = CharSet.Unicode)]
        private static extern uint RegDeleteKey(UIntPtr hKey, string subKey);

        public static void DeleteKey(string key) {
            UIntPtr hKey = UIntPtr.Zero;
            RegOpenKeyEx((UIntPtr)0x80000001u, key, 0, 0x20019, out hKey);
            RegDeleteKey((UIntPtr)0x80000001u, key);
        }
    }
}
'

try {
    Add-Type -TypeDefinition $code
} catch {}

$userSid = ((New-Object System.Security.Principal.NTAccount([Environment]::UserName)).Translate([System.Security.Principal.SecurityIdentifier]).value).ToLower()

function Set-FTA {

    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [String]
        $ProgId,

        [Parameter(Mandatory = $true)]
        [Alias("Protocol")]
        [String]
        $Extension,

        [String]
        $Icon,

        [switch]
        $DomainSID
    )

    if (Test-Path -Path $ProgId) {
        $ProgId = "SFTA." + [System.IO.Path]::GetFileNameWithoutExtension($ProgId).replace(" ", "") + $Extension
    }

    Write-Verbose "ProgId: $ProgId"
    Write-Verbose "Extension/Protocol: $Extension"


    #Write required Application Ids to ApplicationAssociationToasts
    #When more than one application associated with an Extension/Protocol is installed ApplicationAssociationToasts need to be updated
    function local:Write-RequiredApplicationAssociationToasts {
        param (
            [Parameter( Position = 0, Mandatory = $True )]
            [String]
            $ProgId,

            [Parameter( Position = 1, Mandatory = $True )]
            [String]
            $Extension
        )

        $keyPath = "HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\ApplicationAssociationToasts"
        [Microsoft.Win32.Registry]::SetValue($keyPath, $ProgId + "_" + $Extension, 0x0)
        <#

        $allApplicationAssociationToasts = Get-ChildItem -Path HKLM:\SOFTWARE\Classes\$Extension\OpenWithList\* -ErrorAction SilentlyContinue |
        ForEach-Object {
            "Applications\$($_.PSChildName)"
        }

        $allApplicationAssociationToasts += @(
            ForEach ($item in (Get-ItemProperty -Path HKLM:\SOFTWARE\Classes\$Extension\OpenWithProgids -ErrorAction SilentlyContinue).PSObject.Properties ) {
                if ([string]::IsNullOrEmpty($item.Value) -and $item -ne "(default)") {
                    $item.Name
                }
            }
        )


        $allApplicationAssociationToasts += Get-ChildItem -Path HKLM:SOFTWARE\Clients\StartMenuInternet\* , HKCU:SOFTWARE\Clients\StartMenuInternet\* -ErrorAction SilentlyContinue |
        ForEach-Object {
        (Get-ItemProperty ("$($_.PSPath)\Capabilities\" + (@("URLAssociations", "FileAssociations") | Select-Object -Index $Extension.Contains("."))) -ErrorAction SilentlyContinue).$Extension
        }

        $allApplicationAssociationToasts |
        ForEach-Object { if ($_) {
            if (Set-ItemProperty HKCU:\Software\Microsoft\Windows\CurrentVersion\ApplicationAssociationToasts $_"_"$Extension -Value 0 -Type DWord -ErrorAction SilentlyContinue -PassThru) {
                Write-Verbose  ("Write Reg ApplicationAssociationToastsList OK: " + $_ + "_" + $Extension)
            }
            else {
                Write-Verbose  ("Write Reg ApplicationAssociationToastsList FAILED: " + $_ + "_" + $Extension)
            }
            }
        }#>

    }


    function local:Write-ExtensionKeys {
        param (
            [Parameter( Position = 0, Mandatory = $True )]
            [String]
            $ProgId,

            [Parameter( Position = 1, Mandatory = $True )]
            [String]
            $Extension,

            [Parameter( Position = 2, Mandatory = $True )]
            [String]
            $ProgHash
        )


        function local:Remove-UserChoiceKey {
            param (
                [Parameter( Position = 0, Mandatory = $True )]
                [String]
                $Key
            )

            try {
                [Registry.Utils]::DeleteKey($Key)
            } catch {}
        }

        try {
            $keyPath = "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\$Extension\UserChoice"
            Write-Verbose "Remove Extension UserChoice Key If Exist: $keyPath"
            Remove-UserChoiceKey $keyPath
        } catch {
            Write-Verbose "Extension UserChoice Key No Exist: $keyPath"
        }


        try {
            $keyPath = "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\$Extension\UserChoice"
            [Microsoft.Win32.Registry]::SetValue($keyPath, "Hash", $ProgHash)
            [Microsoft.Win32.Registry]::SetValue($keyPath, "ProgId", $ProgId)
            Write-Verbose "Write Reg Extension UserChoice OK"
        } catch {
            throw "Write Reg Extension UserChoice FAILED"
        }
    }

    #use in this special case
    #https://github.com/DanysysTeam/PS-SFTA/pull/7
    function local:Get-UserSidDomain {
        if (-not ("System.DirectoryServices.AccountManagement" -as [type])) {
            Add-Type -AssemblyName System.DirectoryServices.AccountManagement
        }
        [OutputType([string])]
        $userSid = ([System.DirectoryServices.AccountManagement.UserPrincipal]::Current).SID.Value.ToLower()
        Write-Output $userSid
    }

    function local:Get-HexDateTime {
        [OutputType([string])]

        $now = [DateTime]::Now
        $dateTime = [DateTime]::New($now.Year, $now.Month, $now.Day, $now.Hour, $now.Minute, 0)
        $fileTime = $dateTime.ToFileTime()
        $hi = ($fileTime -shr 32)
        $low = ($fileTime -band 0xFFFFFFFFL)
        $dateTimeHex = ($hi.ToString("X8") + $low.ToString("X8")).ToLower()
        Write-Output $dateTimeHex
    }

    function Get-Hash {
        [CmdletBinding()]
        param (
            [Parameter( Position = 0, Mandatory = $True )]
            [string]
            $BaseInfo
        )


        function local:Get-ShiftRight {
            [CmdletBinding()]
            param (
                [Parameter( Position = 0, Mandatory = $true)]
                [long] $iValue,

                [Parameter( Position = 1, Mandatory = $true)]
                [int] $iCount
            )

            if ($iValue -band 0x80000000) {
                Write-Output (( $iValue -shr $iCount) -bxor 0xFFFF0000)
            } else {
                Write-Output  ($iValue -shr $iCount)
            }
        }


        function local:Get-Long {
            [CmdletBinding()]
            param (
                [Parameter( Position = 0, Mandatory = $true)]
                [byte[]] $Bytes,

                [Parameter( Position = 1)]
                [int] $Index = 0
            )

            Write-Output ([BitConverter]::ToInt32($Bytes, $Index))
        }


        function local:Convert-Int32 {
            param (
                [Parameter( Position = 0, Mandatory = $true)]
                [long] $Value
            )

            [byte[]] $bytes = [BitConverter]::GetBytes($Value)
            return [BitConverter]::ToInt32( $bytes, 0)
        }

        [Byte[]] $bytesBaseInfo = [System.Text.Encoding]::Unicode.GetBytes($baseInfo)
        $bytesBaseInfo += 0x00, 0x00

        $MD5 = New-Object -TypeName System.Security.Cryptography.MD5CryptoServiceProvider
        [Byte[]] $bytesMD5 = $MD5.ComputeHash($bytesBaseInfo)

        $lengthBase = ($baseInfo.Length * 2) + 2
        $length = (($lengthBase -band 4) -le 1) + (Get-ShiftRight $lengthBase  2) - 1
        $base64Hash = ""

        if ($length -gt 1) {

            $map = @{PDATA = 0; CACHE = 0; COUNTER = 0 ; INDEX = 0; MD51 = 0; MD52 = 0; OUTHASH1 = 0; OUTHASH2 = 0;
                R0 = 0; R1 = @(0, 0); R2 = @(0, 0); R3 = 0; R4 = @(0, 0); R5 = @(0, 0); R6 = @(0, 0); R7 = @(0, 0)
            }

            $map.CACHE = 0
            $map.OUTHASH1 = 0
            $map.PDATA = 0
            $map.MD51 = (((Get-Long $bytesMD5) -bor 1) + 0x69FB0000L)
            $map.MD52 = ((Get-Long $bytesMD5 4) -bor 1) + 0x13DB0000L
            $map.INDEX = Get-ShiftRight ($length - 2) 1
            $map.COUNTER = $map.INDEX + 1

            while ($map.COUNTER) {
                $map.R0 = Convert-Int32 ((Get-Long $bytesBaseInfo $map.PDATA) + [long]$map.OUTHASH1)
                $map.R1[0] = Convert-Int32 (Get-Long $bytesBaseInfo ($map.PDATA + 4))
                $map.PDATA = $map.PDATA + 8
                $map.R2[0] = Convert-Int32 (($map.R0 * ([long]$map.MD51)) - (0x10FA9605L * ((Get-ShiftRight $map.R0 16))))
                $map.R2[1] = Convert-Int32 ((0x79F8A395L * ([long]$map.R2[0])) + (0x689B6B9FL * (Get-ShiftRight $map.R2[0] 16)))
                $map.R3 = Convert-Int32 ((0xEA970001L * $map.R2[1]) - (0x3C101569L * (Get-ShiftRight $map.R2[1] 16) ))
                $map.R4[0] = Convert-Int32 ($map.R3 + $map.R1[0])
                $map.R5[0] = Convert-Int32 ($map.CACHE + $map.R3)
                $map.R6[0] = Convert-Int32 (($map.R4[0] * [long]$map.MD52) - (0x3CE8EC25L * (Get-ShiftRight $map.R4[0] 16)))
                $map.R6[1] = Convert-Int32 ((0x59C3AF2DL * $map.R6[0]) - (0x2232E0F1L * (Get-ShiftRight $map.R6[0] 16)))
                $map.OUTHASH1 = Convert-Int32 ((0x1EC90001L * $map.R6[1]) + (0x35BD1EC9L * (Get-ShiftRight $map.R6[1] 16)))
                $map.OUTHASH2 = Convert-Int32 ([long]$map.R5[0] + [long]$map.OUTHASH1)
                $map.CACHE = ([long]$map.OUTHASH2)
                $map.COUNTER = $map.COUNTER - 1
            }

            [Byte[]] $outHash = @(0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)
            [byte[]] $buffer = [BitConverter]::GetBytes($map.OUTHASH1)
            $buffer.CopyTo($outHash, 0)
            $buffer = [BitConverter]::GetBytes($map.OUTHASH2)
            $buffer.CopyTo($outHash, 4)

            $map = @{PDATA = 0; CACHE = 0; COUNTER = 0 ; INDEX = 0; MD51 = 0; MD52 = 0; OUTHASH1 = 0; OUTHASH2 = 0;
                R0 = 0; R1 = @(0, 0); R2 = @(0, 0); R3 = 0; R4 = @(0, 0); R5 = @(0, 0); R6 = @(0, 0); R7 = @(0, 0)
            }

            $map.CACHE = 0
            $map.OUTHASH1 = 0
            $map.PDATA = 0
            $map.MD51 = ((Get-Long $bytesMD5) -bor 1)
            $map.MD52 = ((Get-Long $bytesMD5 4) -bor 1)
            $map.INDEX = Get-ShiftRight ($length - 2) 1
            $map.COUNTER = $map.INDEX + 1

            while ($map.COUNTER) {
                $map.R0 = Convert-Int32 ((Get-Long $bytesBaseInfo $map.PDATA) + ([long]$map.OUTHASH1))
                $map.PDATA = $map.PDATA + 8
                $map.R1[0] = Convert-Int32 ($map.R0 * [long]$map.MD51)
                $map.R1[1] = Convert-Int32 ((0xB1110000L * $map.R1[0]) - (0x30674EEFL * (Get-ShiftRight $map.R1[0] 16)))
                $map.R2[0] = Convert-Int32 ((0x5B9F0000L * $map.R1[1]) - (0x78F7A461L * (Get-ShiftRight $map.R1[1] 16)))
                $map.R2[1] = Convert-Int32 ((0x12CEB96DL * (Get-ShiftRight $map.R2[0] 16)) - (0x46930000L * $map.R2[0]))
                $map.R3 = Convert-Int32 ((0x1D830000L * $map.R2[1]) + (0x257E1D83L * (Get-ShiftRight $map.R2[1] 16)))
                $map.R4[0] = Convert-Int32 ([long]$map.MD52 * ([long]$map.R3 + (Get-Long $bytesBaseInfo ($map.PDATA - 4))))
                $map.R4[1] = Convert-Int32 ((0x16F50000L * $map.R4[0]) - (0x5D8BE90BL * (Get-ShiftRight $map.R4[0] 16)))
                $map.R5[0] = Convert-Int32 ((0x96FF0000L * $map.R4[1]) - (0x2C7C6901L * (Get-ShiftRight $map.R4[1] 16)))
                $map.R5[1] = Convert-Int32 ((0x2B890000L * $map.R5[0]) + (0x7C932B89L * (Get-ShiftRight $map.R5[0] 16)))
                $map.OUTHASH1 = Convert-Int32 ((0x9F690000L * $map.R5[1]) - (0x405B6097L * (Get-ShiftRight ($map.R5[1]) 16)))
                $map.OUTHASH2 = Convert-Int32 ([long]$map.OUTHASH1 + $map.CACHE + $map.R3)
                $map.CACHE = ([long]$map.OUTHASH2)
                $map.COUNTER = $map.COUNTER - 1
            }

            $buffer = [BitConverter]::GetBytes($map.OUTHASH1)
            $buffer.CopyTo($outHash, 8)
            $buffer = [BitConverter]::GetBytes($map.OUTHASH2)
            $buffer.CopyTo($outHash, 12)

            [Byte[]] $outHashBase = @(0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)
            $hashValue1 = ((Get-Long $outHash 8) -bxor (Get-Long $outHash))
            $hashValue2 = ((Get-Long $outHash 12) -bxor (Get-Long $outHash 4))

            $buffer = [BitConverter]::GetBytes($hashValue1)
            $buffer.CopyTo($outHashBase, 0)
            $buffer = [BitConverter]::GetBytes($hashValue2)
            $buffer.CopyTo($outHashBase, 4)
            $base64Hash = [Convert]::ToBase64String($outHashBase)
        }

        Write-Output $base64Hash
    }

    Write-Verbose "Getting Hash For $ProgId   $Extension"
    If ($DomainSID.IsPresent) { Write-Verbose  "Use Get-UserSidDomain" } Else { Write-Verbose  "Use Get-UserSid" }
    #$userSid = If ($DomainSID.IsPresent) { Get-UserSidDomain } Else { Get-UserSid }
    $userDateTime = Get-HexDateTime
    Write-Debug "UserDateTime: $userDateTime"
    Write-Debug "UserSid: $userSid"
    Write-Debug "UserExperience: $userExperience"

    $baseInfo = "$Extension$userSid$ProgId$userDateTime$userExperience".ToLower()
    Write-Verbose "baseInfo: $baseInfo"

    $progHash = Get-Hash $baseInfo
    Write-Verbose "Hash: $progHash"

    #Write AssociationToasts List
    Write-RequiredApplicationAssociationToasts $ProgId $Extension

    Write-Verbose "Write Registry Extension: $Extension"
    Write-ExtensionKeys $ProgId $Extension $progHash

}

function Update-RegistryChanges {
    $code = '
    [System.Runtime.InteropServices.DllImport("Shell32.dll")]
    private static extern int SHChangeNotify(int eventId, int flags, IntPtr item1, IntPtr item2);
    public static void Refresh() {
        SHChangeNotify(0x8000000, 0, IntPtr.Zero, IntPtr.Zero);
    }
    '

    try {
        Add-Type -MemberDefinition $code -Namespace SHChange -Name Notify
    } catch {}

    try {
        [SHChange.Notify]::Refresh()
    } catch {}
}


$notepadplusplusPath = "$env:ProgramFiles\Notepad++\notepad++.exe"
if (-not (Test-Path -Path $notepadplusplusPath)) {
    Start-Process "https://notepad-plus-plus.org/downloads/"
}
while (-not (Test-Path -Path $notepadplusplusPath)) {
    Read-Host -Prompt "Notepad++ not found at '$notepadplusplusPath', install it and press Enter to continue..."
}
if (-not (Test-Path -Path $notepadplusplusPath)) {
    echo "Could not find Notepad++ install path"
} else {
    #Todo: maybe on a new windows install notepad++ is not registered. Potentially gotta use Register-FTA

    echo "Setting Notepad++ as default editor for files without extension"
    Set-FTA Applications\notepad++.exe .

    $extensions = @(

        #.log.1, .log.2, etc.
        #We don't know if it's a text file, but those extensions are typically only used for logs
        ".0",
        ".1",
        ".2",
        ".3",
        ".4",
        ".5",
        ".6",
        ".7",
        ".8",
        ".9",
        ".10",
        ".11",
        ".12",
        ".13",
        ".14",
        ".15",
        ".16",
        ".17",
        ".18",
        ".19",
        ".20",

        #Feel free to suggest more txt extensions
        #https://fileinfo.com/filetypes/text
        ".adoc",
        ".asc",
        ".asciidoc",
        ".asm",
        ".bat",
        ".bashrc",
        ".bash_history",
        ".bash_profile",
        ".browserslistrc",
        ".c",
        ".cfg",
        ".cgi",
        ".cjs",
        ".conf",
        ".cpp",
        ".cs",
        ".css",
        ".dsc",
        ".editorconfig",
        ".env",
        ".gitattributes",
        ".gitconfig",
        ".gitignore",
        ".gradle",
        ".h",
        ".hpp",
        ".ini",
        ".js",
        ".json",
        ".jsx",
        ".lesshst",
        ".log",
        ".md",
        ".mjs",
        ".mts",
        ".nfo",
        ".node_repl_history",
        ".php",
        ".pl",
        ".properties",
        ".ps1",
        ".py",
        ".readme",
        ".rb",
        ".rs",
        ".rst",
        ".ruby-gemset",
        ".ruby-version",
        ".sass",
        ".scss",
        ".sh",
        ".sql",
        ".sqliterc",
        ".toml",
        ".ts",
        ".tsx",
        ".txt",
        ".vbs",
        ".viminfo",
        ".vimrc",
        ".vscodeignore",
        ".vue",
        ".wsf",
        ".xml",
        ".yaml",
        ".yml"
    )
    foreach ($ext in $extensions) {
        echo "Setting Notepad++ as default editor for *$ext"
        Set-FTA Applications\notepad++.exe $ext
    }

    echo "Updating registry changes"
    Update-RegistryChanges

}

echo "Done"
