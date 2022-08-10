if exist bin rd bin /s /q
set compilerDir=bin\CSharp.lua
git clone https://github.com/yanghuan/CSharp.lua.git %compilerDir%
set compilerPublishDir=%compilerDir%\bin\Publish
dotnet publish %compilerDir% --configuration Release --output %compilerPublishDir%
set filesDir=bin\files
mkdir %filesDir%
xcopy %compilerPublishDir%\System.xml %filesDir% /y
xcopy %compilerPublishDir%\CSharp.lua.dll %filesDir% /y
xcopy %compilerPublishDir%\Microsoft.CodeAnalysis* %filesDir% /y
xcopy %filesDir% files /y