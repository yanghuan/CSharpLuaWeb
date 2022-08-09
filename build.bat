dotnet build
set dllDir=.\CSharpLuaBlazor\bin\Debug\net6.0\wwwroot\_framework
set buildDir=CSharpLuaBlazor\bin\build
if not exist %buildDir% mkdir %buildDir%
xcopy %dllDir%\System*.dll %buildDir% /s /e /y
xcopy .\files\System.xml %buildDir% /y
cd %buildDir%
set _7z=..\..\..\tools\7z.exe
"%_7z%" a ../data.zip *
cd ..\..\..\
move CSharpLuaBlazor\bin\data.zip CSharpLuaBlazor\wwwroot\
dotnet publish --configuration Release
rd %buildDir% /s /q

