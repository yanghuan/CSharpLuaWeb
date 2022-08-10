if exist bin rd bin /s /q
set buildOutput=bin\Debug
dotnet build --configuration Debug --output %buildOutput%
set debugDllDir=%buildOutput%\wwwroot\_framework
set dataDir=bin\data
if not exist %dataDir% mkdir %dataDir%
xcopy %debugDllDir%\System*.dll %dataDir% /s /e /y
xcopy files\System.xml %dataDir% /y
cd %dataDir%
set workbase=..\..\
set _7z=%workbase%tools\7z.exe
"%_7z%" a ../data.zip *
cd %workbase%
xcopy bin\data.zip CSharpLuaBlazor\wwwroot\ /y
set publishOutput=bin\Publish
dotnet publish --configuration Release --output %publishOutput%

