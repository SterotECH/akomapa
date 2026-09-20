param(
    [string] $SiteName = 'Akomapa',
    [string] $SiteRoot = 'C:\inetpub\akomapa-proxy',
    [string] $BindingAddress = '*',
    [int] $BindingPort = 80,
    [string] $HostHeader = '',
    [int] $WslPort = 8080
)

$ErrorActionPreference = 'Stop'

function Write-Step {
    param([string] $Message)

    Write-Host ''
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Assert-Admin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = [Security.Principal.WindowsPrincipal]::new($identity)

    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw 'Run this script from PowerShell as Administrator.'
    }
}

function Assert-Command {
    param([string] $Command)

    if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
        throw "Required command '$Command' was not found."
    }
}

Assert-Admin

Write-Step 'Installing IIS features'
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole,IIS-WebServer,IIS-CommonHttpFeatures,IIS-DefaultDocument,IIS-StaticContent,IIS-HttpErrors,IIS-HttpRedirect,IIS-ApplicationDevelopment,IIS-ISAPIExtensions,IIS-ISAPIFilter,IIS-ManagementConsole -All -NoRestart | Out-Null

Write-Step 'Checking IIS PowerShell module'
Import-Module WebAdministration

Write-Step 'Creating IIS proxy site root'
New-Item -ItemType Directory -Force -Path $SiteRoot | Out-Null

$webConfig = @"
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="Proxy to WSL Nginx" stopProcessing="true">
                    <match url="(.*)" />
                    <action type="Rewrite" url="http://127.0.0.1:$WslPort/{R:1}" appendQueryString="true" />
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>
"@

Set-Content -Path (Join-Path $SiteRoot 'web.config') -Value $webConfig -Encoding UTF8

Write-Step 'Creating or updating IIS site'
if (Test-Path "IIS:\Sites\$SiteName") {
    Set-ItemProperty "IIS:\Sites\$SiteName" -Name physicalPath -Value $SiteRoot
} else {
    New-Website -Name $SiteName -PhysicalPath $SiteRoot -Port $BindingPort -IPAddress $BindingAddress -HostHeader $HostHeader | Out-Null
}

Set-ItemProperty "IIS:\Sites\$SiteName" -Name enabledProtocols -Value 'http'

Write-Step 'Enabling ARR reverse proxy'
$appcmd = Join-Path $env:SystemRoot 'System32\inetsrv\appcmd.exe'
if (-not (Test-Path $appcmd)) {
    throw 'appcmd.exe was not found. IIS may not be installed correctly.'
}

& $appcmd set config -section:system.webServer/proxy /enabled:"True" /preserveHostHeader:"True" /commit:apphost | Out-Null

Write-Step 'Opening Windows Firewall'
$ruleName = "IIS $SiteName HTTP $BindingPort"
if (-not (Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort $BindingPort | Out-Null
}

Write-Step 'Restarting IIS'
iisreset | Out-Null

Write-Step 'Done'
Write-Host "IIS site: $SiteName"
Write-Host "Public port: $BindingPort"
Write-Host "Proxy target: http://127.0.0.1:$WslPort"
Write-Host ''
Write-Host 'Required manual installs if the rewrite/proxy rule fails:'
Write-Host '- IIS URL Rewrite'
Write-Host '- Application Request Routing (ARR)'
