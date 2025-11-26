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

# Terminal configuration

$consoleWidth = 120
$consoleHeight = 34

$Color0 = 24, 24, 24 #30 - black
$Color1 = 73, 137, 226 #34 - blue
$Color2 = 64, 199, 61 #32 - green
$Color3 = 17, 168, 205 #36 - cyan
$Color4 = 205, 49, 49 #31 - red
$Color5 = 202, 90, 202 #35 - magenta
$Color6 = 229, 229, 16 #33 - yellow
$Color7 = 215, 215, 215 #37 - white
$Color8 = 150, 150, 150 #90 - bright black (gray)
$Color9 = 74, 152, 245 #94 - bright blue
$Color10 = 70, 206, 70 #92 - bright green
$Color11 = 41, 184, 219 #96 - bright cyan
$Color12 = 241, 76, 76 #93 - bright red
$Color13 = 214, 112, 214 #95 - bright magenta
$Color14 = 245, 245, 67 #91 - bright yellow
$Color15 = 242, 242, 242 #97 - bright white

# End of config


$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true

$isAdmin = (New-Object Security.Principal.WindowsPrincipal ([Security.Principal.WindowsIdentity]::GetCurrent())).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
if ($isAdmin) {echo "Running as Administrator"} else {echo "Running as standard user. Some tweaks may not be applied."}

$isWindows11 = ((Get-CimInstance -ClassName Win32_OperatingSystem).Version -ge "10.0.22000")
if ($isWindows11) {echo "Detected Windows 11"} else {echo "Detected Windows 10 or lower"}

$needsExplorerRestart = $false
$needsSignOut = $false
$needsAdmin = $false

if (-not (Test-Path "HKU:")) {New-PSDrive HKU Registry HKEY_USERS | Out-Null}
if (-not (Test-Path "HKCR:")) {New-PSDrive -Name "HKCR" -PSProvider Registry -Root "HKEY_CLASSES_ROOT" | Out-Null}

function grantRegKeyPermissions {
    param ([string]$regPath)
    if (-not $regPath.startswith("HKCR:", "CurrentCultureIgnoreCase")) {
        throw "Unsupported hive for granting permissions to '$regPath'"
    }
    $regPath = $regPath.Substring(5)

    Add-Type @"
    using System;
    using System.Runtime.InteropServices;
    using System.Security.AccessControl;

    public class RegistryOwnership
    {
        [DllImport("advapi32.dll", SetLastError = true)]
        public static extern int RegOpenKeyEx(
            IntPtr hKey,
            string subKey,
            int ulOptions,
            int samDesired,
            out IntPtr hkResult);

        [DllImport("advapi32.dll", SetLastError = true)]
        public static extern int RegCloseKey(IntPtr hKey);

        [DllImport("advapi32.dll", SetLastError = true)]
        public static extern int RegSetKeySecurity(
            IntPtr hKey,
            int SecurityInformation,
            byte[] pSecurityDescriptor);

        public const int WRITE_OWNER = 0x00080000;
        public const int WRITE_DAC = 0x00040000;
        public static readonly IntPtr HKEY_CLASSES_ROOT = new IntPtr(unchecked((int)0x80000000));
        public const int OWNER_SECURITY_INFORMATION = 0x00000001;
        public const int DACL_SECURITY_INFORMATION = 0x00000004;
    }
"@

    # Enable SeRestorePrivilege and SeTakeOwnershipPrivilege
    Add-Type @"
    using System;
    using System.Runtime.InteropServices;

    public class TokenManipulator
    {
        [DllImport("advapi32.dll", ExactSpelling = true, SetLastError = true)]
        internal static extern bool AdjustTokenPrivileges(IntPtr htok, bool disall,
            ref TokPriv1Luid newst, int len, IntPtr prev, IntPtr relen);

        [DllImport("kernel32.dll", ExactSpelling = true)]
        internal static extern IntPtr GetCurrentProcess();

        [DllImport("advapi32.dll", ExactSpelling = true, SetLastError = true)]
        internal static extern bool OpenProcessToken(IntPtr h, int acc, ref IntPtr phtok);

        [DllImport("advapi32.dll", SetLastError = true)]
        internal static extern bool LookupPrivilegeValue(string host, string name, ref long pluid);

        [StructLayout(LayoutKind.Sequential, Pack = 1)]
        internal struct TokPriv1Luid
        {
            public int Count;
            public long Luid;
            public int Attr;
        }

        internal const int SE_PRIVILEGE_ENABLED = 0x00000002;
        internal const int TOKEN_QUERY = 0x00000008;
        internal const int TOKEN_ADJUST_PRIVILEGES = 0x00000020;

        public static bool AddPrivilege(string privilege)
        {
            IntPtr hproc = GetCurrentProcess();
            IntPtr htok = IntPtr.Zero;
            if (!OpenProcessToken(hproc, TOKEN_ADJUST_PRIVILEGES | TOKEN_QUERY, ref htok))
                return false;
            
            TokPriv1Luid tp;
            tp.Count = 1;
            tp.Luid = 0;
            tp.Attr = SE_PRIVILEGE_ENABLED;
            
            if (!LookupPrivilegeValue(null, privilege, ref tp.Luid))
                return false;
            
            return AdjustTokenPrivileges(htok, false, ref tp, 0, IntPtr.Zero, IntPtr.Zero);
        }
    }
"@

    [TokenManipulator]::AddPrivilege("SeRestorePrivilege") | Out-Null
    [TokenManipulator]::AddPrivilege("SeTakeOwnershipPrivilege") | Out-Null
    [TokenManipulator]::AddPrivilege("SeBackupPrivilege") | Out-Null

    $hKey = [IntPtr]::Zero
    # Open key with WRITE_OWNER access
    $result = [RegistryOwnership]::RegOpenKeyEx(
        [RegistryOwnership]::HKEY_CLASSES_ROOT,
        $regPath,
        0,
        [RegistryOwnership]::WRITE_OWNER,
        [ref]$hKey
    )
    if ($result -ne 0) {
        throw "Failed to open key '$regPath'. Error: $result"
    }

    $keyCR = [Microsoft.Win32.Registry]::ClassesRoot.OpenSubKey($regPath, [Microsoft.Win32.RegistryKeyPermissionCheck]::ReadWriteSubTree, [System.Security.AccessControl.RegistryRights]::TakeOwnership)
    $aclCR = $keyCR.GetAccessControl([System.Security.AccessControl.AccessControlSections]::None)
    $adminsSid = New-Object System.Security.Principal.SecurityIdentifier('S-1-5-32-544')
    $aclCR.SetOwner($adminsSid)
    $keyCR.SetAccessControl($aclCR)

    $AddACL = New-Object System.Security.AccessControl.RegistryAccessRule ($adminsSid,"FullControl","ContainerInherit,ObjectInherit","None","Allow")
    $aclCR = $keyCR.GetAccessControl()
    $aclCR.SetAccessRule($AddACL)
    $keyCR.SetAccessControl($aclCR)
    $keyCR.Close()

    #[RegistryOwnership]::RegCloseKey([IntPtr]::Zero) | Out-Null

}

function applyRegEdits {
    #Generic function to edit/remove keys and properties, and check if the changes are already applied
    param (
        [string]$Title,
        [Parameter(Mandatory=$true)]
        [array]$Modifications
    )
    #Fix for the array unrolling behavior
    if ($modifications[0] -is [string]) {
        $Modifications = @(,$Modifications)
    }

    $areModificationsRequired = $false

    $titleParts = $Title -split " ", 2
    $lowercaseTitle = $titleParts[0].ToLower() + " " + $titleParts[1]
    $titleParts[0] = switch ($titleParts[0]) {
        "Add"      { "Added" }
        "Remove"   { "Removed" }
        "Set"      { "Set" }
        "Increase" { "Increased" }
        "Enable"   { "Enabled" }
        "Disable"  { "Disabled" }
        "Restore"  { "Restored" }
        "Fix"      { "Fixed" }
        Default    { $titleParts[0] + "ed" }
    }
    $pastTenseTitle = $titleParts[0] + " " + $titleParts[1]
    $lowercasePastTenseTitle = $titleParts[0].ToLower() + " " + $titleParts[1]

    foreach ($mod in $Modifications) {
        $action = $mod[0]
        if (@("RemoveKey","NewKey","RemoveProperty","SetProperty") -notcontains $action) {
            throw "Unknown action '$action'"
        }
        $key = $mod[1]
        if (-not ($key)) {throw "No key specified for action '$action'"}
        $key = $key.replace("/", "\")
        $pathParts = $key -split "\\", 2
        $hiveName = $pathParts[0].TrimEnd(':') # Remove colon (HKCU: -> HKCU)
        $subKeyPath = if ($pathParts.Count -gt 1) { $pathParts[1] } else { "" }

        $rootKey = switch ($hiveName) {
            { $_ -eq "HKCR" } { [Microsoft.Win32.Registry]::ClassesRoot }
            { $_ -eq "HKCU" } { [Microsoft.Win32.Registry]::CurrentUser }
            { $_ -eq "HKLM" } { [Microsoft.Win32.Registry]::LocalMachine }
            { $_ -eq "HKU" } { [Microsoft.Win32.Registry]::Users }
            Default { throw "Unknown registry hive '$hiveName'" }
        }
        $hiveNameNeedsAdmin = ($hiveName -in @("HKLM","HKU","HKCR"))

        if ($action -eq "RemoveKey") {
            $additionalParams = $mod[2]
            
            $existingKey = $rootKey.OpenSubKey($subKeyPath, $false)
            if ($existingKey -eq $null) {continue}
            $existingKey.Close()
            
        } elseif ($action -eq "RemoveProperty") {
            $property = $mod[2]
            if (-not ($property)) { throw "No property specified for action '$action'" }
            $additionalParams = $mod[3]

            $existingKey = $rootKey.OpenSubKey($subKeyPath, $false)
            if ($existingKey -eq $null) {continue}
            
            $existingValue = $existingKey.GetValue($property)
            $existingKey.Close()
            if ($existingValue -eq $null) {continue}
            
        } elseif ($action -eq "NewKey") {
            $additionalParams = $mod[2]
            
            $existingKey = $rootKey.OpenSubKey($subKeyPath, $false)
            if ($existingKey -ne $null) {
                $existingKey.Close()
                continue
            }

        } elseif ($action -eq "SetProperty") {
            $property = $mod[2]
            if (-not ($property)) { throw "No property specified for action '$action'" }
            if ($property -eq "(default)") {$property = ""}
            $value = $mod[3]
            if ($null -eq $value) { throw "No value specified for action '$action'" }
            $additionalParams = $mod[4]

            $existingKey = $rootKey.OpenSubKey($subKeyPath, $false)
            if ($existingKey -ne $null) {
                $existingValue = $existingKey.GetValue($property)
                $existingKey.Close()
                if ($existingValue -ne $null -and $existingValue.getType().Name -eq "Byte[]") {
                    if (@(Compare-Object $existingValue $value -SyncWindow 0).Length -eq 0) {continue}
                } elseif ($existingValue -eq $value) {continue} 
            }
        }
        
        if ($hiveNameNeedsAdmin -and -not $isAdmin) {
            Write-Host "Cannot $lowercaseTitle, needs admin rights" -ForegroundColor Yellow
            return
        }
        
        if ($additionalParams.grantPermissions -eq $true) {
            grantRegKeyPermissions $key
        }

        $areModificationsRequired = $true

        if ($action -eq "RemoveKey") {
            $rootKey.DeleteSubKeyTree($subKeyPath)

        } elseif ($action -eq "RemoveProperty") {
            $rwKey = $rootKey.OpenSubKey($subKeyPath, $true)
            $rwKey.DeleteValue($property)
            $rwKey.Close()

        } elseif ($action -eq "NewKey") {
            $rootKey.CreateSubKey($subKeyPath).Close()

        } elseif ($action -eq "SetProperty") {
            $regKind = [Microsoft.Win32.RegistryValueKind]::String # Default
            if ($value -is [int]) {
                $regKind = [Microsoft.Win32.RegistryValueKind]::DWord
            } elseif ($value -is [long]) {
                $regKind = [Microsoft.Win32.RegistryValueKind]::QWord
            } elseif ($value -is [byte[]]) {
                $regKind = [Microsoft.Win32.RegistryValueKind]::Binary
            }
            if ($additionalParams -and $additionalParams.ContainsKey("Type")) {
                switch ($additionalParams["Type"]) {
                    "DWord"        { $regKind = [Microsoft.Win32.RegistryValueKind]::DWord }
                    "QWord"        { $regKind = [Microsoft.Win32.RegistryValueKind]::QWord }
                    "Binary"       { $regKind = [Microsoft.Win32.RegistryValueKind]::Binary }
                    "ExpandString" { $regKind = [Microsoft.Win32.RegistryValueKind]::ExpandString }
                    "MultiString"  { $regKind = [Microsoft.Win32.RegistryValueKind]::MultiString }
                }
            }

            $rwKey = $rootKey.CreateSubKey($subKeyPath, $true)
            $rwKey.SetValue($property, $value, $regKind)
            $rwKey.Close()
        }
    }

    if ($areModificationsRequired) {
        Write-Host "$pastTenseTitle"
    } else {
        Write-Host "Already $lowercasePastTenseTitle" -ForegroundColor DarkGray
    }

    if ($areModificationsRequired -and $additionalParams.explorerRestart -eq $true) {
        $script:needsExplorerRestart = $true
    }
    if ($areModificationsRequired -and $additionalParams.signout -eq $true) {
        $script:needsSignOut = $true
    }
}

# Taskbar

applyRegEdits "Remove taskbar search" @(
    @("SetProperty", "HKCU:\Software\Microsoft\Windows\CurrentVersion\Search", "SearchboxTaskbarMode", 0, @{explorerRestart=(-not $isWindows11)})
)
applyRegEdits "Remove taskbar task view button" @(
    @("SetProperty", "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced", "ShowTaskViewButton", 0, @{explorerRestart=$true})
)
applyRegEdits "Remove taskbar contacts button" @(
    @("SetProperty", "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\People", "PeopleBand", 0, @{explorerRestart=$true})
)
applyRegEdits "Disable bing search in search menu" @(
    @("SetProperty", "HKCU:\Software\Microsoft\Windows\CurrentVersion\Search", "BingSearchEnabled", 0)
)

# Cleanup Explorer context menu

applyRegEdits "Remove Visual Studio from Explorer context menu" @(
    @("RemoveKey", "HKCR:\Directory\Background\shell\AnyCode"),
    @("RemoveKey", "HKCR:\Directory\shell\AnyCode")
)

applyRegEdits "Remove 'Edit with Paint 3D' from Explorer context menu" @(
    @("RemoveKey", "HKCR:\SystemFileAssociations\.3mf\Shell\3D Edit"),
    @("RemoveKey", "HKCR:\SystemFileAssociations\.bmp\Shell\3D Edit"),
    @("RemoveKey", "HKCR:\SystemFileAssociations\.fbx\Shell\3D Edit"),
    @("RemoveKey", "HKCR:\SystemFileAssociations\.gif\Shell\3D Edit"),
    @("RemoveKey", "HKCR:\SystemFileAssociations\.jfif\Shell\3D Edit"),
    @("RemoveKey", "HKCR:\SystemFileAssociations\.jpe\Shell\3D Edit"),
    @("RemoveKey", "HKCR:\SystemFileAssociations\.jpeg\Shell\3D Edit"),
    @("RemoveKey", "HKCR:\SystemFileAssociations\.jpg\Shell\3D Edit"),
    @("RemoveKey", "HKCR:\SystemFileAssociations\.png\Shell\3D Edit"),
    @("RemoveKey", "HKCR:\SystemFileAssociations\.tif\Shell\3D Edit"),
    @("RemoveKey", "HKCR:\SystemFileAssociations\.tiff\Shell\3D Edit")
)


applyRegEdits "Remove 'Share' / 'Give access to' from Explorer context menu" @(
    @("RemoveKey", "HKCR:\*\shellex\ContextMenuHandlers\ModernSharing"),
    @("RemoveKey", "HKCR:\*\shellex\ContextMenuHandlers\Sharing"),
    @("RemoveKey", "HKCR:\Directory\Background\shellex\ContextMenuHandlers\Sharing"),
    @("RemoveKey", "HKCR:\Directory\shellex\ContextMenuHandlers\Sharing"),
    @("RemoveKey", "HKCR:\Drive\shellex\ContextMenuHandlers\Sharing"),
    @("RemoveKey", "HKCR:\LibraryFolder\background\shellex\ContextMenuHandlers\Sharing"),
    @("RemoveKey", "HKCR:\UserLibraryFolder\shellex\ContextMenuHandlers\Sharing")
)

applyRegEdits "Remove VLC from Explorer context menu" @(
    @("RemoveKey", "HKCR:\directory\shell\AddToPlaylistVLC"),
    @("RemoveKey", "HKCR:\directory\shell\PlayWithVLC")
)

applyRegEdits "Remove Winamp from Explorer context menu" @(
    @("RemoveKey", "HKCR:\directory\shell\Winamp.Bookmark"),
    @("RemoveKey", "HKCR:\directory\shell\Winamp.Enqueue"),
    @("RemoveKey", "HKCR:\directory\shell\Winamp.Play")
)

applyRegEdits "Remove Windows Media Player from Explorer context menu" @(
    @("RemoveKey", "HKCR:\SystemFileAssociations\Directory.Audio\shell\Enqueue"),
    @("RemoveKey", "HKCR:\SystemFileAssociations\Directory.Audio\shell\Play"),
    @("RemoveKey", "HKCR:\SystemFileAssociations\Directory.Video\shell\Enqueue"),
    @("RemoveKey", "HKCR:\SystemFileAssociations\Directory.Video\shell\Play"),
    @("RemoveKey", "HKCR:\SystemFileAssociations\Directory.Image\shell\Enqueue"),
    @("RemoveKey", "HKCR:\SystemFileAssociations\Directory.Image\shell\Play"),
    @("RemoveKey", "HKCR:\SystemFileAssociations\audio\shell\Enqueue"),
    @("RemoveKey", "HKCR:\SystemFileAssociations\audio\shell\Play"),
    @("RemoveKey", "HKCR:\SystemFileAssociations\video\shell\Enqueue"),
    @("RemoveKey", "HKCR:\SystemFileAssociations\video\shell\Play")
)

applyRegEdits "Remove WizTree from Explorer context menu" @(
    @("RemoveKey", "HKCR:\directory\shell\WizTree"),
    @("RemoveKey", "HKCR:\directory\background\shell\WizTree"),
    @("RemoveKey", "HKCR:\Folder\shell\WizTree")
)

applyRegEdits "Remove 'Open Git GUI here' from Explorer context menu" @(
    @("RemoveKey", "HKCR:\directory\shell\git_gui"),
    @("RemoveKey", "HKCR:\directory\background\shell\git_gui")
)

applyRegEdits "Remove 'Open Linux shell here' from Explorer context menu" @(
    @("RemoveKey", "HKCR:\directory\shell\WSL"),
    @("RemoveKey", "HKCR:\directory\background\shell\WSL")
)

applyRegEdits "Remove 'Restore previous versions' from Explorer context menu" @(
    @("RemoveKey", "HKCR:\AllFilesystemObjects\shellex\ContextMenuHandlers\{596AB062-B4D2-4215-9F74-E9109B0A8153}"),
    @("RemoveKey", "HKCR:\CLSID\{450D8FBA-AD25-11D0-98A8-0800361B1103}\shellex\ContextMenuHandlers\{596AB062-B4D2-4215-9F74-E9109B0A8153}"),
    @("RemoveKey", "HKCR:\Directory\shellex\ContextMenuHandlers\{596AB062-B4D2-4215-9F74-E9109B0A8153}"),
    @("RemoveKey", "HKCR:\Drive\shellex\ContextMenuHandlers\{596AB062-B4D2-4215-9F74-E9109B0A8153}")
)

applyRegEdits "Remove 'Add to library' from Explorer context menu" @(
    @("RemoveKey", "HKCR:\Folder\shellex\ContextMenuHandlers\Library Location")
)

applyRegEdits "Remove 'Pin to Quick access' from Explorer context menu" @(
    @("RemoveKey", "HKCR:\Folder\shell\pintohome")
)

applyRegEdits "Remove 'Pin to Start Menu' from Explorer context menu" @(
    @("RemoveKey", "HKCR:\exefile\shellex\ContextMenuHandlers\PintoStartScreen"),
    @("RemoveKey", "HKCR:\mscfile\shellex\ContextMenuHandlers\PintoStartScreen"),
    @("RemoveKey", "HKCR:\Folder\shellex\ContextMenuHandlers\PintoStartScreen"),
    @("RemoveKey", "HKCR:\Microsoft.Website\shellex\ContextMenuHandlers\PintoStartScreen")
)

applyRegEdits "Remove 'New -> Microsoft Access file' from Explorer context menu" @(
    @("RemoveKey", "HKCR:\.accdb\Access.Application.16\ShellNew"),
    @("RemoveKey", "HKCR:\.mdb\ShellNew")
)
applyRegEdits "Remove 'New -> Bitmap image' from Explorer context menu" @(
    @("RemoveKey", "HKCR:\.bmp\ShellNew")
)
applyRegEdits "Remove 'New -> Microsoft Publisher file' from Explorer context menu" @(
    @("RemoveKey", "HKCR:\.pub\Publisher.Document.16\ShellNew")
)
applyRegEdits "Remove 'New -> Microsoft Visio Drawing' from Explorer context menu" @(
    @("RemoveKey", "HKCR:\.vsdx\Visio.Drawing.15\ShellNew")
)
applyRegEdits "Remove 'New -> RTF file' from Explorer context menu" @(
    @("RemoveKey", "HKCR:\.rtf\ShellNew")
)
applyRegEdits "Remove 'New -> Contact' from Explorer context menu" @(
    @("RemoveKey", "HKCR:\.contact\ShellNew")
)

# Add useful stuff to Explorer context menu

applyRegEdits "Set 'Set as desktop wallpaper' to shift + right click only" @(
    @("SetProperty", "HKCR:\SystemFileAssociations\.bmp\Shell\setdesktopwallpaper", "Extended", ""),
    @("SetProperty", "HKCR:\SystemFileAssociations\.dib\Shell\setdesktopwallpaper", "Extended", ""),
    @("SetProperty", "HKCR:\SystemFileAssociations\.gif\Shell\setdesktopwallpaper", "Extended", ""),
    @("SetProperty", "HKCR:\SystemFileAssociations\.jfif\Shell\setdesktopwallpaper", "Extended", ""),
    @("SetProperty", "HKCR:\SystemFileAssociations\.jpe\Shell\setdesktopwallpaper", "Extended", ""),
    @("SetProperty", "HKCR:\SystemFileAssociations\.jpeg\Shell\setdesktopwallpaper", "Extended", ""),
    @("SetProperty", "HKCR:\SystemFileAssociations\.jpg\Shell\setdesktopwallpaper", "Extended", ""),
    @("SetProperty", "HKCR:\SystemFileAssociations\.png\Shell\setdesktopwallpaper", "Extended", ""),
    @("SetProperty", "HKCR:\SystemFileAssociations\.tif\Shell\setdesktopwallpaper", "Extended", ""),
    @("SetProperty", "HKCR:\SystemFileAssociations\.tiff\Shell\setdesktopwallpaper", "Extended", ""),
    @("SetProperty", "HKCR:\SystemFileAssociations\.wdp\Shell\setdesktopwallpaper", "Extended", "")
)

applyRegEdits "Display 'Open Powershell here' in Explorer context menu without shift" @(
    @("RemoveProperty", "HKCR:\Directory\shell\Powershell", "Extended", @{grantPermissions=$true}),
    @("SetProperty", "HKCR:\Directory\shell\Powershell", "Icon", "C:\Windows\system32\WindowsPowerShell\v1.0\powershell.exe", @{grantPermissions=$true}),
    @("RemoveProperty", "HKCR:\Directory\background\shell\Powershell", "Extended", @{grantPermissions=$true}),
    @("SetProperty", "HKCR:\Directory\background\shell\Powershell", "Icon", "C:\Windows\system32\WindowsPowerShell\v1.0\powershell.exe", @{grantPermissions=$true})
)

#As https://superuser.com/a/1131932/1068224 points out, the default "Copy as Path" menu is hardcoded to only display on shift+right click.
#The only workaround is to create a Shell entry instead of a ShellEx entry.
#If we remove the existing ShellEx entry, the Shell entry stops working (why? idk.)
#I did not find a way to remove or hide that entry (putting it in HKCU:\Software\Microsoft\Windows\CurrentVersion\Shell Extensions\Blocked does nothing), so unfortunately there are two "Copy as Path" entries on shift + right click.
#Remove-Item -LiteralPath "HKCR:\AllFilesystemObjects\shellex\ContextMenuHandlers\CopyAsPathMenu"
if (-not $isWindows11) {
    applyRegEdits "Display 'Copy as Path' in Explorer context menu without shift" @(
        @("SetProperty", "HKCR:\AllFilesystemObjects\shell\windows.copyaspath", "(default)", "@shell32.dll,-30328"),
        @("SetProperty", "HKCR:\AllFilesystemObjects\shell\windows.copyaspath", "InvokeCommandOnSelection", 1),
        @("SetProperty", "HKCR:\AllFilesystemObjects\shell\windows.copyaspath", "VerbHandler", "{f3d06e7c-1e45-4a26-847e-f9fcdee59be0}"),
        @("SetProperty", "HKCR:\AllFilesystemObjects\shell\windows.copyaspath", "Position", "Bottom")
    )
} else {
    #In windows 11, Copy as Path is visible without shift, so remove our additional entry.
    applyRegEdits "Remove additional 'Copy as Path' from Explorer context menu" @(
        @("RemoveKey", "HKCR:\AllFilesystemObjects\shell\windows.copyaspath")
    )
}

#https://winaero.com/find-your-current-wallpaper-image-path-in-windows-10/
$getCurrentWallpaperCommand = @'
    $data = (Get-ItemProperty -Path "HKCU:\Control Panel\Desktop" -Name "TranscodedImageCache" -ErrorAction SilentlyContinue).TranscodedImageCache
    if ($data -and $data.Count -gt 24) {
        $path = [System.Text.Encoding]::Unicode.GetString($data, 24, $data.Length - 24)
        $path = $path.Trim([char]0)
        Start-Process "explorer.exe" -ArgumentList "/select,`"$path`""
    }
'@
$encodedCommand = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($getCurrentWallpaperCommand))
$viewWallpaperLocation = if ((Get-WinSystemLocale).Name -eq "fr-FR") { "Voir l'emplacement du fond d'$([char]0xE9)cran" } else { "View wallpaper location" }
applyRegEdits "Add 'View wallpaper location' to Desktop context menu" @(
    @("SetProperty", "HKCR:\DesktopBackground\Shell\DesktopWallpaperLocation", "(default)", "$viewWallpaperLocation"),
    @("SetProperty", "HKCR:\DesktopBackground\Shell\DesktopWallpaperLocation", "Icon", "imageres.dll,-5346"),
    @("SetProperty", "HKCR:\DesktopBackground\Shell\DesktopWallpaperLocation\command", "(default)", "conhost.exe --headless powershell.exe -NoProfile -WindowStyle Hidden -EncodedCommand $encodedCommand")
)

#https://superuser.com/questions/920267/shellnew-icon-for-file-type
applyRegEdits "Add 'New -> File' to Explorer context menu" @(
    @("SetProperty", "HKCR:\.", "(default)", "No Extension"),
    @("SetProperty", "HKCR:\.\ShellNew", "NullFile", ""),
    @("SetProperty", "HKCR:\.\ShellNew", "IconPath", "C:\windows\system32\imageres.dll,2"),
    @("SetProperty", "HKCR:\.\ShellNew\Config", "NoExtension", ""),
    @("SetProperty", "HKCR:\No Extension", "FriendlyTypeName", "@shell32.dll,-4130")
)


function setExplorerQuickAccessRibbon {
    $path = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Ribbon'
    $valueName = 'QatItems'

    $raw = (Get-ItemProperty -Path $path -Name $valueName).$valueName
    $xmlText = [Text.Encoding]::UTF8.GetString($raw)
    [xml]$xml = $xmlText
    $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
    $ns.AddNamespace('siq', 'http://schemas.microsoft.com/windows/2009/ribbon/qat')
    $shared = $xml.SelectSingleNode('//siq:sharedControls', $ns)

    $idsToEnsure = 'siq:12301','siq:12303'
    $areModificationsRequired = $false

    foreach ($id in $idsToEnsure) {
        $node = $xml.SelectSingleNode("//siq:control[@idQ='$id']", $ns)
        if (-not $node) {
            $new = $xml.CreateElement('siq','control',$ns.LookupNamespace('siq'))
            $new.SetAttribute('idQ', $id)
            $new.SetAttribute('visible','true')
            $new.SetAttribute('argument','0')
            $shared.AppendChild($new) | Out-Null
            $areModificationsRequired = $true
        }
    }
    if (-not $areModificationsRequired) {
        Write-Host "Already added Powershell to Explorer Quick Access ribbon" -ForegroundColor DarkGray
        return
    }

    $updated = $xml.OuterXml
    $bytes = [Text.Encoding]::UTF8.GetBytes($updated)
    Set-ItemProperty -Path $path -Name $valueName -Value $bytes -Type Binary
    echo "Added Powershell to Explorer Quick Access ribbon"
}
setExplorerQuickAccessRibbon


if ($isWindows11) {
    
    #https://old.reddit.com/r/Windows11/comments/1i0o7d7/is_there_a_tool_that_lets_you_easily_modify/m6zqu16/
    applyRegEdits "Remove 'Open with Notepad' from Explorer context menu" @(
        @("SetProperty", "HKCU:/Software/Microsoft/Windows/CurrentVersion/Shell Extensions/Blocked/", "{CA6CC9F1-867A-481E-951E-A28C5E4F01EA}", "Edit in Notepad", @{explorerRestart=$true})
    )
    applyRegEdits "Remove 'Share' from Explorer context menu" @(
        @("SetProperty", "HKCU:/Software/Microsoft/Windows/CurrentVersion/Shell Extensions/Blocked/", "{e2bf9676-5f8f-435c-97eb-11607a5bedf7}", "Share", @{explorerRestart=$true})
    )
    applyRegEdits "Remove 'Ask Copilot' from Explorer context menu" @(
        @("SetProperty", "HKCU:/Software/Microsoft/Windows/CurrentVersion/Shell Extensions/Blocked/", "{CB3B0003-8088-4EDE-8769-8B354AB2FF8C}", "Ask Copilot", @{explorerRestart=$true})
    )
    applyRegEdits "Remove 'Edit with Photos / Create with Designer / Edit with Clipchamp' from Explorer context menu" @(
        @("SetProperty", "HKCU:/Software/Microsoft/Windows/CurrentVersion/Shell Extensions/Blocked/", "{BFE0E2A4-C70C-4AD7-AC3D-10D1ECEBB5B4}", "Edit with Photos", @{explorerRestart=$true}),
        @("SetProperty", "HKCU:/Software/Microsoft/Windows/CurrentVersion/Shell Extensions/Blocked/", "{1100CBCD-B822-43F0-84CB-16814C2F6B44}", "Erase Object with Photos", @{explorerRestart=$true}),
        @("SetProperty", "HKCU:/Software/Microsoft/Windows/CurrentVersion/Shell Extensions/Blocked/", "{7A53B94A-4E6E-4826-B48E-535020B264E5}", "Create with Designer", @{explorerRestart=$true}),
        @("SetProperty", "HKCU:/Software/Microsoft/Windows/CurrentVersion/Shell Extensions/Blocked/", "{9AAFEDA2-97B6-43EA-9466-9DE90501B1B6}", "Visual Search with Bing", @{explorerRestart=$true}),
        @("SetProperty", "HKCU:/Software/Microsoft/Windows/CurrentVersion/Shell Extensions/Blocked/", "{8AB635F8-9A67-4698-AB99-784AD929F3B4}", "Edit with Clipchamp", @{explorerRestart=$true})
    )
    applyRegEdits "Remove 'Cast to Device' from Explorer context menu" @(
        @("SetProperty", "HKCU:/Software/Microsoft/Windows/CurrentVersion/Shell Extensions/Blocked/", "{7AD84985-87B4-4a16-BE58-8B72A5B390F7}", "Cast to Device", @{explorerRestart=$true})
    )

    applyRegEdits "Set start menu layout to 'More Recommendations'" @(
        @("SetProperty", "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced", "Start_Layout", 0x02)
    )
    applyRegEdits "Set taskbar to be left aligned" @(
        @("SetProperty", "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced", "TaskbarAl", 0x00)
    )
    
    # Removes Widgets from the Taskbar
    # Is blocked by the UCPD: https://www.elevenforum.com/t/enable-or-disable-userchoice-protection-driver-ucpd-in-windows-11-and-10.24267/
    # https://forums.mydigitallife.net/threads/taskbarda-widgets-registry-change-is-now-blocked.88547/
    # Set-ItemProperty -LiteralPath "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "TaskbarDa" -Value 0x00

    applyRegEdits "Remove Gallery from Explorer sidebar" @(
        @("SetProperty", "HKCU:\Software\Classes\CLSID\{e88865ea-0e1c-4e20-9aa6-edcd0212c87c}", "System.IsPinnedToNameSpaceTree", 0x00)
    )
    applyRegEdits "Set scrollbars to always show" @(
        @("SetProperty", "HKCU:\Control Panel\Accessibility", "DynamicScrollbars", 0, @{signout=$true})
    )
    applyRegEdits "Restore old Explorer right click menu" @(
        @("SetProperty", "HKCU:\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32", "(default)", "")
    )
    applyRegEdits "Set compact mode in Explorer" @(
        @("SetProperty", "HKCU:/Software/Microsoft/Windows/CurrentVersion/Explorer\Advanced", "UseCompactMode", 1)
    )
    applyRegEdits "Increase scrollbar size" @(
        @("SetProperty", "HKCU:/Control Panel\Desktop\WindowMetrics", "ScrollHeight", "-330", @{signout=$true}),
        @("SetProperty", "HKCU:/Control Panel\Desktop\WindowMetrics", "ScrollWidth", "-330", @{signout=$true})
    )

    #https://www.elevenforum.com/t/restore-classic-file-explorer-with-ribbon-in-windows-11.620/
    applyRegEdits "Enable ribbon in Explorer" @(
        @("SetProperty", "HKCU:\Software\Classes\CLSID\{2aa9162e-c906-4dd9-ad0b-3d24a8eef5a0}", "(default)", "CLSID_ItemsViewAdapter"),
        @("SetProperty", "HKCU:\Software\Classes\CLSID\{2aa9162e-c906-4dd9-ad0b-3d24a8eef5a0}\InProcServer32", "(default)", ""),
        @("SetProperty", "HKCU:\Software\Classes\CLSID\{6480100b-5a83-4d1e-9f69-8ae5a88e9a33}", "(default)", "CLSID_ItemsViewAdapter"),
        @("SetProperty", "HKCU:\Software\Classes\CLSID\{6480100b-5a83-4d1e-9f69-8ae5a88e9a33}\InProcServer32", "(default)", "")
    )

    function rgbToHex {
        param ([int[]]$rgb)
        return ('#{0:X2}{1:X2}{2:X2}' -f $rgb[0], $rgb[1], $rgb[2])
    }
    $terminalSettings = @"
    {
        "`$help": "https://aka.ms/terminal-documentation",
        "`$schema": "https://aka.ms/terminal-profiles-schema",
        "actions": [],
        "alwaysOnTop": false,
        "alwaysShowTabs": false,
        "copyFormatting": "none",
        "copyOnSelect": false,
        "defaultProfile": "{61c54bbd-c2c6-5271-96e7-009a87ff44bf}",
        "initialRows": $consoleHeight,
        "keybindings": [{
            "id": "Terminal.CopyToClipboard",
            "keys": "ctrl+c"
        },{
            "id": "Terminal.PasteFromClipboard",
            "keys": "ctrl+v"
        },{
            "id": "Terminal.DuplicatePaneAuto",
            "keys": "alt+shift+d"
        }],
        "newTabMenu": [{
            "type": "remainingProfiles"
        }],
        "newTabPosition": "afterCurrentTab",
        "profiles": {
            "defaults": {
                "colorScheme": "zez.dev",
                "font": {
                    "cellHeight": "1.1",
                    "face": "Consolas",
                    "size": 11,
                    "weight": "normal"
                },
                "opacity": 100,
                "padding": "2",
                "useAcrylic": false
            },
            "list": [{
                "commandline": "%SystemRoot%\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
                "guid": "{61c54bbd-c2c6-5271-96e7-009a87ff44bf}",
                "hidden": false,
                "name": "Windows PowerShell"
            },{
                "commandline": "%SystemRoot%\\System32\\cmd.exe",
                "guid": "{0caa0dad-35be-5f56-a8ff-afceeeaa6101}",
                "hidden": false,
                "name": "Invite de commandes"
            },{
                "guid": "{b453ae62-4e3d-5e58-b989-0a998ec441b8}",
                "hidden": false,
                "name": "Azure Cloud Shell",
                "source": "Windows.Terminal.Azure"
            },{
                "guid": "{d667c8f4-340a-5a02-83e8-de231666da94}",
                "hidden": false,
                "name": "Developer Command Prompt for VS 2022",
                "source": "Windows.Terminal.VisualStudio"
            },{
                "guid": "{405e1125-8357-5c2f-a026-d3f69f4efbb2}",
                "hidden": false,
                "name": "Developer PowerShell for VS 2022",
                "source": "Windows.Terminal.VisualStudio"
            }]
        },
        "schemes": [{
            "name": "zez.dev",

            "background": "$(rgbToHex $Color0)",
            "cursorColor": "$(rgbToHex $Color7)",
            "foreground": "$(rgbToHex $Color7)",
            "selectionBackground": "$(rgbToHex $Color7)",

            "black": "$(rgbToHex $Color0)",
            "blue": "$(rgbToHex $Color1)",
            "green": "$(rgbToHex $Color2)",
            "cyan": "$(rgbToHex $Color3)",
            "red": "$(rgbToHex $Color4)",
            "purple": "$(rgbToHex $Color5)",
            "yellow": "$(rgbToHex $Color6)",
            "white": "$(rgbToHex $Color7)",
            "brightBlack": "$(rgbToHex $Color8)",
            "brightBlue": "$(rgbToHex $Color9)",
            "brightGreen": "$(rgbToHex $Color10)",
            "brightCyan": "$(rgbToHex $Color11)",
            "brightRed": "$(rgbToHex $Color12)",
            "brightPurple": "$(rgbToHex $Color13)",
            "brightYellow": "$(rgbToHex $Color14)",
            "brightWhite": "$(rgbToHex $Color15)"
        }],
        "showTabsInTitlebar": false,
        "tabWidthMode": "titleLength",
        "themes": [],
        "useAcrylicInTabRow": false,
        "warning.confirmCloseAllTabs": false
    }
"@
    if ((Get-Content "$env:LOCALAPPDATA\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json" -Raw -ErrorAction SilentlyContinue) -eq $terminalSettings) {
        Write-Host "Already applied Windows Terminal settings" -ForegroundColor DarkGray
    } else {
        [IO.File]::WriteAllText("$env:LOCALAPPDATA\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json", $terminalSettings)
        echo "Applied Windows Terminal settings"
    }
}

applyRegEdits "Set Explorer to display hidden files" @(
    @("SetProperty", "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced", "Hidden", 1)
)
applyRegEdits "Set Explorer to display file extensions" @(
    @("SetProperty", "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced", "HideFileExt", 0)
)
applyRegEdits "Set Explorer to display system files" @(
    @("SetProperty", "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced", "ShowSuperHidden", 1)
)
applyRegEdits "Set Explorer to open to Downloads folder" @(
    @("SetProperty", "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced", "LaunchTo", 3)
)
applyRegEdits "Disable window shake to minimize" @(
    @("SetProperty", "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced", "DisallowShaking", 1)
)

#todo: sometimes makes explorer crash on startup? check the LaunchTo property above if so
applyRegEdits "Set Explorer to display path for libraries" @(
    #Desktop
    @("RemoveKey", "HKLM:\Software\Microsoft\Windows\CurrentVersion\Explorer\FolderDescriptions\{754AC886-DF64-4CBA-86B5-F7FBF4FBCEF5}", "ParsingName"),
    #Documents
    @("RemoveKey", "HKLM:\Software\Microsoft\Windows\CurrentVersion\Explorer\FolderDescriptions\{f42ee2d3-909f-4907-8871-4c22fc0bf756}", "ParsingName"),
    #Downloads
    @("RemoveKey", "HKLM:\Software\Microsoft\Windows\CurrentVersion\Explorer\FolderDescriptions\{7d83ee9b-2244-4e70-b1f5-5393042af1e4}", "ParsingName"),
    #Music
    @("RemoveKey", "HKLM:\Software\Microsoft\Windows\CurrentVersion\Explorer\FolderDescriptions\{a0c69a99-21c8-4671-8703-7934162fcf1d}", "ParsingName"),
    #Pictures
    @("RemoveKey", "HKLM:\Software\Microsoft\Windows\CurrentVersion\Explorer\FolderDescriptions\{0ddd015d-b06c-45d5-8c4c-f59713854639}", "ParsingName"),
    #Videos
    @("RemoveKey", "HKLM:\Software\Microsoft\Windows\CurrentVersion\Explorer\FolderDescriptions\{35286a68-3c57-41a1-bbb1-0eae73d76c95}", "ParsingName")
)

#Feels too weird
#echo "Setting drive letters to be before labels"
#Set-ItemProperty -LiteralPath "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer" -Name "ShowDriveLettersFirst" -Value 4

applyRegEdits "Set wallpaper quality to 100%" @(
    @("SetProperty", "HKCU:/Control Panel/Desktop", "JPEGImportQuality", 100)
)

applyRegEdits "Set blue accent color" @(
    @("SetProperty", "HKCU:/Software/Microsoft/Windows/DWM", "AccentColor", 0xffb16300),
    @("SetProperty", "HKCU:/Software/Microsoft/Windows/DWM", "ColorizationColor", 0xc40063B1),
    @("SetProperty", "HKCU:/Software/Microsoft/Windows/DWM", "ColorizationColorBalance", 0x59),
    @("SetProperty", "HKCU:/Software/Microsoft/Windows/DWM", "ColorizationAfterglow", 0xc40063B1),
    @("SetProperty", "HKCU:/Software/Microsoft/Windows/DWM", "ColorizationAfterglowBalance", 0x0A),
    @("SetProperty", "HKCU:/Software/Microsoft/Windows/DWM", "ColorizationBlurBalance", 0x01),
    @("SetProperty", "HKCU:/Software/Microsoft/Windows/DWM", "EnableWindowColorization", 0x01),
    @("SetProperty", "HKCU:/Software/Microsoft/Windows/DWM", "ColorizationGlassAttribute", 0x01),
    @("SetProperty", "HKCU:/Software/Microsoft/Windows/CurrentVersion/Themes/Personalize", "ColorPrevalence", 0x01),
    @("SetProperty", "HKCU:/Software/Microsoft/Windows/CurrentVersion/Themes/Personalize", "AppsUseLightTheme", 0x00),
    @("SetProperty", "HKCU:/Software/Microsoft/Windows/CurrentVersion/Themes/History", "AutoColor", 0x00),
    @("SetProperty", "HKCU:/Software/Microsoft/Windows/CurrentVersion/Explorer/Accent", "AccentPalette", ([byte[]](134,202,255,0,95,178,242,0,30,145,234,0,0,99,177,0,0,66,117,0,0,45,79,0,0,32,56,0,0,204,106,0))),
    @("SetProperty", "HKCU:/Software/Microsoft/Windows/CurrentVersion/Explorer/Accent", "StartColorMenu", 0xff754200),
    #This value has to be the last, as it triggers a change. https://www.reddit.com/r/Windows11/comments/sw15u0/dark_theme_did_you_notice_the_ugly_pale_accent/
    @("SetProperty", "HKCU:/Software/Microsoft/Windows/CurrentVersion/Explorer/Accent", "AccentColorMenu", 0xffb16300)
)


function setRegistryFavorites {
    $favorites = @(
        "HKCR:\AllFilesystemObjects",
        "HKCR:\CLSID",
        "HKCR:\Directory",
        "HKCR:\Drive",
        "HKCR:\Folder",
        "HKCR:\Local Settings",
        "HKCR:\SystemFileAssociations",

        "HKCU:\Software\Microsoft\Windows\CurrentVersion",
        "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer",
        "HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies",
        "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run",

        "HKLM:\Software\Microsoft\Windows\CurrentVersion",
        "HKLM:\Software\Microsoft\Windows\CurrentVersion\Explorer",
        "HKLM:\Software\Microsoft\Windows\CurrentVersion\Policies",
        "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run",
        "HKLM:\Software\Microsoft\Windows NT\CurrentVersion",
        "HKLM:\System\CurrentControlSet",
        "HKLM:\System\CurrentControlSet\Control\Session Manager\Environment"
    )

    $favoritesPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Applets\Regedit\Favorites"
    if (-not (Test-Path $favoritesPath)) {
        New-Item -Path $favoritesPath -Force | Out-Null
    }
    $existingProps = Get-ItemProperty $favoritesPath
    $existingFavorites = @{}
    
    foreach ($prop in $existingProps.PSObject.Properties) {
        if ($prop.Name -notin @("PSPath", "PSParentPath", "PSChildName", "PSDrive", "PSProvider")) {
            $existingFavorites[$prop.Name] = $prop.Value
        }
    }

    function Get-RegeditPath {
        param([string]$path)
        $path = $path -replace '^HKLM:\\', 'HKEY_LOCAL_MACHINE\'
        $path = $path -replace '^HKCU:\\', 'HKEY_CURRENT_USER\'
        $path = $path -replace '^HKCR:\\', 'HKEY_CLASSES_ROOT\'
        $path = $path -replace '^HKU:\\',  'HKEY_USERS\'
        return $path
    }

    $allItems = [System.Collections.ArrayList]::new()

    foreach ($name in $existingFavorites.Keys) {
        $val = $existingFavorites[$name]
        $hive = "Other"
        
        if ($name -match "^HKCR:\\") { $hive = "HKCR" }
        elseif ($name -match "^HKCU:\\") { $hive = "HKCU" }
        elseif ($name -match "^HKLM:\\") { $hive = "HKLM" }
        elseif ($name -match "^HKU:\\")  { $hive = "HKU" }
        #Remove existing separators
        if ($name -match "^ +$") { continue }
        
        $allItems.Add([PSCustomObject]@{
            Name  = $name
            Value = $val
            Hive  = $hive
        }) | Out-Null
    }

    $nbAddedFavorites = 0
    foreach ($favPath in $favorites) {
        $alreadyExists = $allItems | Where-Object { $_.Name -eq $favPath }
        
        if (-not $alreadyExists) {
            $regVal = Get-RegeditPath -path $favPath
            
            $hive = "Other"
            if ($favPath -match "^HKCR:\\") { $hive = "HKCR" }
            elseif ($favPath -match "^HKCU:\\") { $hive = "HKCU" }
            elseif ($favPath -match "^HKLM:\\") { $hive = "HKLM" }
            elseif ($favPath -match "^HKU:\\")  { $hive = "HKU" }

            $allItems.Add([PSCustomObject]@{
                Name  = $favPath
                Value = $regVal
                Hive  = $hive
            }) | Out-Null
            $nbAddedFavorites++ | Out-Null
        }
    }

    if ($nbAddedFavorites -eq 0) {
        Write-Host "Already added Regedit favorites" -ForegroundColor DarkGray
        return
    }

    #Order all favorites
    #Replace space with "~" so that "Windows NT\" comes after "Windows\"
    $sortExpr = @{ Expression = { $_.Name.Replace(' ', '~') } }
    $bucketHKCR = $allItems | Where-Object { $_.Hive -eq "HKCR" } | Sort-Object $sortExpr
    $bucketHKCU = $allItems | Where-Object { $_.Hive -eq "HKCU" } | Sort-Object $sortExpr
    $bucketHKLM = $allItems | Where-Object { $_.Hive -eq "HKLM" } | Sort-Object $sortExpr
    $bucketHKU  = $allItems | Where-Object { $_.Hive -eq "HKU" }  | Sort-Object $sortExpr
    $bucketOther= $allItems | Where-Object { $_.Hive -eq "Other" }| Sort-Object $sortExpr

    $global:spaceCounter = 1
    function Get-Separator {
        $sep = " " * $global:spaceCounter
        $global:spaceCounter++
        return [PSCustomObject]@{ Name = $sep; Value = "" }
    }
    $finalList = @()

    if ($bucketHKCR) { 
        $finalList += $bucketHKCR
    }
    if ($bucketHKCU) { 
        if ($bucketHKCR) {
            $finalList += (Get-Separator) 
        }
        $finalList += $bucketHKCU
    }
    if ($bucketHKLM) {
        if ($bucketHKCR -or $bucketHKCU) {
            $finalList += (Get-Separator) 
        }
        $finalList += $bucketHKLM
    }
    if ($bucketHKU) { 
        if ($bucketHKCR -or $bucketHKCU -or $bucketHKLM) {
            $finalList += (Get-Separator) 
        }
        $finalList += $bucketHKU
    }
    if ($bucketOther) {
        if ($bucketHKCR -or $bucketHKCU -or $bucketHKLM -or $bucketHKU) {
            $finalList += (Get-Separator) 
        }
        $finalList += $bucketOther
    }

    #Delete all existing favorites then replace, as the order is determined by the insertion order. https://superuser.com/questions/1860659/where-is-the-ordering-of-windows-regedit-favorites-menu-stored

    #echo ($finalList | ConvertTo-Json)
    Remove-ItemProperty -Path $favoritesPath -Name "*"
    foreach ($item in $finalList) {
        if ($item) {
            Set-ItemProperty -Path $favoritesPath -Name $item.Name -Value $item.Value
        }
    }
    Write-Host "Added $nbAddedFavorites Regedit Favorites"
}
setRegistryFavorites


$taskManagerSettings = (Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\TaskManager").Preferences
if ($taskManagerSettings[28] -eq 0) {
    Write-Host "Already set Task Manager to expanded view" -ForegroundColor DarkGray
} else {
    $taskManagerSettings[28] = 0 #1 for compact view, 0 for expanded view
    Set-ItemProperty -LiteralPath "HKCU:\Software\Microsoft\Windows\CurrentVersion\TaskManager" -Name "Preferences" -Value $taskManagerSettings
    echo "Set Task Manager to expanded view"
}

applyRegEdits "Fix console colors for Python" @(
    @("SetProperty", "HKCU:/Console", "VirtualTerminalLevel", 1)
)

# In the registry, those values are stored in little endian
function rgbToAABBGGRR {
    param ([int[]]$rgb)
    return '00{0:X2}{1:X2}{2:X2}' -f $rgb[2], $rgb[1], $rgb[0]
}

$colors = @(
    $Color0, $Color1, $Color2, $Color3, $Color4, $Color5, $Color6, $Color7,
    $Color8, $Color9, $Color10, $Color11, $Color12, $Color13, $Color14, $Color15
)
$regPaths = @(
    "HKCU:\Console",
    "HKCU:\Console\%SystemRoot%_system32_cmd.exe",
    "HKCU:\Console\%SystemRoot%_System32_WindowsPowerShell_v1.0_powershell.exe",
    "HKCU:\Console\%SystemRoot%_SysWOW64_WindowsPowerShell_v1.0_powershell.exe",
    #S-1-5-18 is the SYSTEM account
    "HKU:\S-1-5-18\Console",
    "HKU:\S-1-5-18\Console\%SystemRoot%_system32_cmd.exe",
    "HKU:\S-1-5-18\Console\%SystemRoot%_System32_WindowsPowerShell_v1.0_powershell.exe",
    "HKU:\S-1-5-18\Console\%SystemRoot%_SysWOW64_WindowsPowerShell_v1.0_powershell.exe"
    #Those two don't work
    #"HKCU:\Console\%SystemRoot%_System32_WindowsPowerShell_v1.0_powershell_ise.exe",
    #"HKCU:\Console\%SystemRoot%_SysWOW64_WindowsPowerShell_v1.0_powershell_ise.exe"
)

foreach ($regPath in $regPaths) {

    $cmdType = @{
        "Console" = "default console";
        "%SystemRoot%_system32_cmd.exe" = "cmd.exe";
        "%SystemRoot%_System32_WindowsPowerShell_v1.0_powershell.exe" = "PowerShell";
        "%SystemRoot%_SysWOW64_WindowsPowerShell_v1.0_powershell.exe" = "32-bit PowerShell"
    }[$regPath.Split('\')[-1]]

    if ($regPath.startsWith("HKU:\S-1-5-18")) {
        $user = "SYSTEM"
    } else {
        $user = "current user"
    }
    $modifications = @()
    for ($i = 0; $i -lt $colors.Count; $i++) {
        $colorValue = rgbToAABBGGRR $colors[$i]
        $colorValue = + "0x$colorValue"
        $regKey = "ColorTable{0:d2}" -f $i
        $modifications += ,@("SetProperty", $regPath, $regKey, $colorValue)
    }
    applyRegEdits "Set $user $cmdType colors" $modifications

    applyRegEdits "Set $user $cmdType additional properties" @(
        @("SetProperty", $regPath, "ScreenColors", 0x00000007), # black on white
        @("SetProperty", $regPath, "PopupColors", 0x00000007), # black on white
        @("SetProperty", $regPath, "FaceName", "Consolas"),
        @("SetProperty", $regPath, "FontFamily", 0x00000036), # Consolas
        @("SetProperty", $regPath, "FontWeight", 0x00000190), # 400
        @("SetProperty", $regPath, "FontSize", 0x00100000),   # 16px
        @("SetProperty", $regPath, "HistoryBufferSize", 999),
        @("SetProperty", $regPath, "HistoryNoDup", 1),
        @("SetProperty", $regPath, "WindowSize", (($consoleHeight -shl 16) -bor $consoleWidth))
    )
}

#Depending on how you launch Powershell/CMD, the settings will be read from the shortcut files instead of the registry.
#We therefore need to patch the shortcuts directly as well.
function patchShortcut {
    param (
        [string]$shortcutDesc,
        [string]$shortcutPath,
        [string]$shortcutContentBase64,
        [int]$colorOffset,
        [int]$sizeOffset
    )

    $shortcutContent = [System.Convert]::FromBase64String($shortcutContentBase64)
    if (-not (Test-Path -LiteralPath $shortcutPath)) {
        New-Item -Path $shortcutPath -ItemType File -Force | Out-Null
    }
    for ($i = 0; $i -lt $colors.Count; $i++) {
        $offset = $colorOffset + ($i * 4) + 1 # +1 for the first byte which is always 0
        $colors[$i] | ForEach-Object { $shortcutContent[$offset++] = $_ }
    }
    if ($sizeOffset) {
        $shortcutContent[$sizeOffset] = $consoleWidth
        $shortcutContent[$sizeOffset + 4] = $consoleWidth
        $shortcutContent[$sizeOffset + 6] = $consoleHeight
    }
    
    $existingContent = Get-Content -LiteralPath $shortcutPath -Encoding Byte
    if (@(Compare-Object $existingContent $shortcutContent -SyncWindow 0).Length -eq 0) {
        Write-Host "Already patched $shortcutDesc shortcut" -ForegroundColor DarkGray
        return
    }

    Set-Content -LiteralPath $shortcutPath -Value $shortcutContent -Encoding Byte
    echo "Patched $shortcutDesc shortcut"
}

patchShortcut "powershell" "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Windows PowerShell\Windows PowerShell.lnk" "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" 0x87E 0x7FF

patchShortcut "powershell x86" "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Windows PowerShell\Windows PowerShell (x86).lnk" "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" 0x87E 0x7FF

patchShortcut "cmd" "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\System Tools\Command Prompt.lnk" "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" 0x49F


# We can get conditional prompts with the autorun value, but only at startup (can't display git branch for example)
# Using environment variables is risky in batch, so don't add user@hostname when connecting via ssh to avoid potential command injection
# Powershell is too long to start up
# And it is too risky. If the autorun command has a syntax error, then you simply cannot connect via ssh
#if not %userdomain% == %computername% (
#    if not %userdomain% == WORKGROUP
#        (set prompt=$e[33m%userdomain%\\%username%@%computername%$e[92m $p$e[0m$g$s)
#    else
#        (set prompt=$e[33m%username%@%computername%$e[92m $p$e[0m$g$s)
#) else
#    (set prompt=$e[33m%username%@%computername%$e[92m $p$e[0m$g$s)

# Use fltmc to test admin rights - https://stackoverflow.com/a/28268802/4851350

applyRegEdits "Set cmd.exe prompt" @(
    @("SetProperty", "HKCU:\Environment", "PROMPT", '$e[92m$p$e[0m$g$s'),
    @("SetProperty", "HKCU:\Software\Microsoft\Command Processor", "AutoRun", @'

if defined ssh_connection
    (set prompt=$e[95m[SSH] $e[92m$p$e[0m$g$s)
else (
    fltmc > nul 2>&1
    && (set prompt=$e[91m[Admin] $e[92m$p$e[0m$g$s)
    || (set prompt=$e[92m$p$e[0m$g$s)
)
'@.Replace("`n", " "))
)
applyRegEdits "Set SYSTEM cmd.exe prompt" @(
    @("SetProperty", "HKU:\S-1-5-18\Environment", "PROMPT", '$e[91m[SYSTEM]$e[92m $p$e[0m$g ')
)


$profileContent = @'
#https://www.it-connect.fr/comment-personnaliser-le-prompt-de-son-environnement-powershell/
#https://github.com/tbaheux/itconnect/blob/master/profile.ps1

# Version: ###DATE###
# irm zez.dev | iex

#Automatically add HKU and HKCR registry drives
if (-not (Test-Path "HKU:")) {
    New-PSDrive HKU Registry HKEY_USERS | Out-Null
}
if (-not (Test-Path "HKCR:")) {
    New-PSDrive -Name "HKCR" -PSProvider Registry -Root "HKEY_CLASSES_ROOT" | Out-Null
}

function prompt {
    $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    $currentSid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User
    #Unlike $env:hostname, the hostname command returns the dns name (which isn't all uppercase)
    $currentHost = $(hostname)
    #Remove redundant domain name from user
    $currentUser = $currentUser -replace [regex]::Escape("$currentHost\".toUpper()), ''
    $isAdmin = (New-Object Security.Principal.WindowsPrincipal ([Security.Principal.WindowsIdentity]::GetCurrent())).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
    $isInSsh = Test-Path env:SSH_CONNECTION
    #Disable admin indicator in ssh sessions, as it seems windows puts admin by default
    $adminPrompt = if ($currentSid -eq "S-1-5-18") { "[SYSTEM] " } elseif ($isAdmin -and -not $isInSsh) { "[Admin] " } else { "" }
    $sshPrompt = "$currentUser@$currentHost"
    $currentPath = (Get-Location).Path

    #feels too weird
    #$currentPath = $currentPath -replace [regex]::Escape($env:USERPROFILE), '~'

    try {
        $gitBranch = (git rev-parse --abbrev-ref HEAD 2>$null)
        #If checking out a specific commit, we need to use --short
        if ($gitBranch -eq "HEAD") {
            $gitBranch = (git rev-parse --short HEAD 2>$null)
        }
        if ($gitBranch -eq "master" -or $gitBranch -eq "main") {
            $gitBranch = ""
        }
    } catch {
        $gitBranch = ""
    }
    $host.UI.RawUI.WindowTitle = "$adminPrompt$currentPath$(if ($gitBranch) { " ($gitBranch)" } else { '' }) - Powershell"
    Write-Host $adminPrompt -NoNewline -ForegroundColor Red
    if ($isInSsh) {
        Write-Host "$sshPrompt " -NoNewline -foregroundcolor magenta
    }
    Write-Host "PS " -NoNewline -ForegroundColor Green
    Write-Host "$currentPath" -NoNewline -ForegroundColor Cyan
    if ($gitBranch) {
        if ($isInSsh) {
            Write-Host " $gitBranch" -NoNewline -ForegroundColor Yellow
        } else {
            Write-Host " $gitBranch" -NoNewline -ForegroundColor Magenta
        }
    }
    #It seems it is not possible to accurately detect if the last command failed
    #if ($? -eq $false) {
    #    Write-Host ">" -NoNewline -ForegroundColor Red
    #} else {
    #    Write-Host ">" -NoNewline -ForegroundColor White
    #}
    return "$([char]27)[0m> "
}
'@

if ((Get-Content "$env:USERPROFILE\Documents\WindowsPowerShell\profile.ps1" -Raw -ErrorAction SilentlyContinue) -eq $profileContent -and
    (Get-Content "$env:USERPROFILE\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1" -Raw -ErrorAction SilentlyContinue) -eq $profileContent) {
    Write-Host "Already set PowerShell profile" -ForegroundColor DarkGray
} else {
    [IO.File]::WriteAllText("$env:USERPROFILE\Documents\WindowsPowerShell\profile.ps1", $profileContent)
    [IO.File]::WriteAllText("$env:USERPROFILE\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1", $profileContent)
    echo "Set Powershell profile"
}

if ((Get-Content "C:\WINDOWS\system32\config\systemprofile\Documents\WindowsPowerShell\profile.ps1" -Raw -ErrorAction SilentlyContinue) -eq $profileContent -and
    (Get-Content "C:\WINDOWS\system32\config\systemprofile\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1" -Raw -ErrorAction SilentlyContinue) -eq $profileContent) {
    Write-Host "Already set SYSTEM PowerShell profile" -ForegroundColor DarkGray
} else {
    if ($isAdmin) {
        echo "Set SYSTEM Powershell profile"
        New-Item -Path "C:\WINDOWS\system32\config\systemprofile\Documents\WindowsPowerShell" -ItemType Directory -Force | Out-Null
        [IO.File]::WriteAllText("C:\WINDOWS\system32\config\systemprofile\Documents\WindowsPowerShell\profile.ps1", $profileContent)
        [IO.File]::WriteAllText("C:\WINDOWS\system32\config\systemprofile\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1", $profileContent)
    } else {
        Write-Host "Cannot set SYSTEM Powershell profile, needs admin rights" -ForegroundColor Yellow
    }
}


$bashrcPath = "$env:USERPROFILE\.bashrc"
$bashrc = @'
###BASHRC###
'@

if ($bashrc.Trim() -ne "#`##BASHRC###") {
    if ((Get-Content $bashrcPath -Raw -ErrorAction SilentlyContinue) -eq $bashrc) {
        Write-Host "Already set .bashrc" -ForegroundColor DarkGray
    } else {
        [IO.File]::WriteAllText($bashrcPath, $bashrc)
        echo "Set .bashrc"
    }
}
if (-not (Test-Path "$env:USERPROFILE\.bash_profile")) {
    echo "Creating .bash_profile to source .bashrc and .profile"
    [IO.File]::WriteAllText("$env:USERPROFILE\.bash_profile", @'
test -f ~/.profile && . ~/.profile
test -f ~/.bashrc && . ~/.bashrc
'@)
}


# Custom French keyboard

$keyboardDll = [System.Convert]::FromBase64String("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")
$keyboardDllPath = "$env:SystemRoot\System32\keyboard_fr_improved_zez.dev.dll"

if ((Test-Path $keyboardDllPath) -and (@(Compare-Object $keyboardDll (Get-Content $keyboardDllPath -Encoding Byte) -SyncWindow 0).Length -eq 0)) {
    Write-Host "Already installed enhanced French keyboard dll" -ForegroundColor DarkGray
} else {
    if (-not $isAdmin) {
        Write-Host "Cannot install enhanced French keyboard dll, needs admin rights" -ForegroundColor Yellow
    } else {
        Set-Content -Path $keyboardDllPath -Value $keyboardDll -Encoding Byte
        Write-Host "Installed enhanced French keyboard dll"
    }
}

$frenchKeyboardId = "0000040c"
$enhancedFrenchKeyboardId = "beef040c"

applyRegEdits "Set enhanced French keyboard as substitute for standard French keyboard" @(
    @("SetProperty", "HKLM:\SYSTEM\CurrentControlSet\Control\Keyboard Layouts\$enhancedFrenchKeyboardId", "Layout Text", "Fran$([char]0xE7)ais (am$([char]0xE9)lior$([char]0xE9)) - zez.dev", @{signout=$true}),
    @("SetProperty", "HKLM:\SYSTEM\CurrentControlSet\Control\Keyboard Layouts\$enhancedFrenchKeyboardId", "Layout File", "keyboard_fr_improved_zez.dev.dll", @{signout=$true}),
    @("SetProperty", "HKCU:\Keyboard Layout\Substitutes", $frenchKeyboardId, $enhancedFrenchKeyboardId, @{signout=$true})

)


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
#or if joined to a domain:
#https://github.com/DanysysTeam/PS-SFTA/pull/7
#if (-not ("System.DirectoryServices.AccountManagement" -as [type])) {
#    Add-Type -AssemblyName System.DirectoryServices.AccountManagement
#}
#$userSid = ([System.DirectoryServices.AccountManagement.UserPrincipal]::Current).SID.Value.#ToLower()

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
        $Icon
    )

    if (Test-Path -LiteralPath $ProgId) {
        $ProgId = "SFTA." + [System.IO.Path]::GetFileNameWithoutExtension($ProgId).replace(" ", "") + $Extension
    }
    if ([Microsoft.Win32.Registry]::GetValue("HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\$Extension\UserChoice", "ProgId", $null) -eq $ProgId) {
        #Write-Host "Already set $ProgId for $Extension" -ForegroundColor DarkGray
        return
    }
    echo "Setting $ProgId as default program for extension $Extension"
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
            Remove-UserChoiceKey $keyPath
        } catch {}
        try {
            $keyPath = "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\$Extension\UserChoice"
            [Microsoft.Win32.Registry]::SetValue($keyPath, "Hash", $ProgHash)
            [Microsoft.Win32.Registry]::SetValue($keyPath, "ProgId", $ProgId)
        } catch {
            throw "Write Reg Extension UserChoice FAILED"
        }
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
            $map = @{PDATA = 0; CACHE = 0; COUNTER = 0 ; INDEX = 0; MD51 = 0; MD52 = 0; OUTHASH1 = 0; OUTHASH2 = 0; R0 = 0; R1 = @(0, 0); R2 = @(0, 0); R3 = 0; R4 = @(0, 0); R5 = @(0, 0); R6 = @(0, 0); R7 = @(0, 0)}

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

            $map = @{PDATA = 0; CACHE = 0; COUNTER = 0 ; INDEX = 0; MD51 = 0; MD52 = 0; OUTHASH1 = 0; OUTHASH2 = 0; R0 = 0; R1 = @(0, 0); R2 = @(0, 0); R3 = 0; R4 = @(0, 0); R5 = @(0, 0); R6 = @(0, 0); R7 = @(0, 0)}

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
    $userDateTime = Get-HexDateTime
    $baseInfo = "$Extension$userSid$ProgId$userDateTime$userExperience".ToLower()
    $progHash = Get-Hash $baseInfo

    Write-RequiredApplicationAssociationToasts $ProgId $Extension
    Write-ExtensionKeys $ProgId $Extension $progHash
}

$notepadplusplusPath = "$env:ProgramFiles\Notepad++\notepad++.exe"
if (-not (Test-Path -LiteralPath $notepadplusplusPath)) {
    Write-Host "Could not find Notepad++ install path at '$notepadplusplusPath'. Install it at https://notepad-plus-plus.org/downloads/ if necessary." -ForegroundColor Yellow
} else {
    #Todo: maybe on a new windows install notepad++ is not registered. Potentially gotta use Register-FTA
    $ConfigPath = "$env:APPDATA\Notepad++\config.xml"
    $Xml = [xml](Get-Content -Path $ConfigPath)
    $Node = $Xml.SelectSingleNode("//GUIConfig[@name='ScintillaPrimaryView']")

    $areNppModificationsRequired = $false
    if ($Node) {
        if ($Node.GetAttribute("Wrap") -eq "yes") {
            Write-Host "Already enabled Notepad++ line wrap" -ForegroundColor DarkGray
        } else {
            $Node.SetAttribute("Wrap", "yes")
            $areNppModificationsRequired = $true
            echo "Enabled Notepad++ line wrap"
        }
        if ($Node.GetAttribute("scrollBeyondLastLine") -eq "yes") {
            Write-Host "Already enabled Notepad++ scroll beyond last line" -ForegroundColor DarkGray
        } else {
            $Node.SetAttribute("scrollBeyondLastLine", "yes")
            $areNppModificationsRequired = $true
            echo "Enabled Notepad++ scroll beyond last line"
        }
    }
    else {
        Write-Error "Could not find 'ScintillaPrimaryView' node in config.xml"
    }

    #Set new document to be LF instead of CRLF
    $Node = $Xml.SelectSingleNode("//GUIConfig[@name='NewDocDefaultSettings']")
    if ($Node) {
        if ($Node.GetAttribute("format") -eq "2") {
            Write-Host "Already set Notepad++ new document line ending to LF" -ForegroundColor DarkGray
        } else {
            $Node.SetAttribute("format", "2")
            $areNppModificationsRequired = $true
            echo "Set Notepad++ new document line ending to LF"
        }
    }
    else {
        Write-Error "Could not find 'NewDocDefaultSettings' node in config.xml"
    }
    
    if ($areNppModificationsRequired) {
        if (Get-Process -Name "notepad++" -ErrorAction SilentlyContinue) {
            Write-Host "Notepad++ is running, close it then relaunch this script to modify the notepad++ config" -ForegroundColor Yellow
        } else {
            $Xml.Save($ConfigPath)
        }
    }

    #Don't associate .bat and .ps1, otherwise we can no longer run batch files from the command line
    try {
        [Registry.Utils]::DeleteKey("Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.bat\UserChoice")
    } catch {}
    try {
        [Registry.Utils]::DeleteKey("Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.ps1\UserChoice")
    } catch {}

    Set-FTA Applications\notepad++.exe .
    
    $extensions = @(

        #.log.1, .log.2, etc.
        #We don't know if it's a text file, but those extensions are typically only used for logs
        ".0",".1",".2",".3",".4",".5",".6",".7",".8",".9",".10",".11",".12",".13",".14",".15",".16",".17",".18",".19",".20",

        #Feel free to suggest more txt extensions
        #https://fileinfo.com/filetypes/text
        ".adoc",
        ".asc",
        ".asciidoc",
        ".asm",
        #".bat",
        ".bashrc",
        ".bash_login",
        ".bash_logout",
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
        ".info",
        ".ini",
        ".js",
        ".json",
        ".jsx",
        ".lesshst",
        ".log",
        ".md",
        ".mjs",
        ".mts",
        ".mysql_history",
        ".nfo",
        ".node_repl_history",
        ".php",
        ".pl",
        ".profile",
        ".properties",
        #".ps1",
        ".py",
        ".python_history",
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
        ".sqlite_history",
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
        Set-FTA Applications\notepad++.exe $ext
    }
}

# Refresh explorer to apply changes
$code = '
[System.Runtime.InteropServices.DllImport("Shell32.dll")]
private static extern int SHChangeNotify(int eventId, int flags, IntPtr item1, IntPtr item2);
public static void Refresh() {
    SHChangeNotify(0x8000000, 0, IntPtr.Zero, IntPtr.Zero);
}
'
try {
    Add-Type -MemberDefinition $code -Namespace SHChange -Name Notify
    [SHChange.Notify]::Refresh()
} catch {}

if ($needsSignOut) {
    echo "Done! Please restart your computer or sign out and sign back in to apply all changes."
} elseif ($needsExplorerRestart) {
    echo "Done! Please restart explorer.exe to apply all changes."
} else {
    echo "Done!"
}
