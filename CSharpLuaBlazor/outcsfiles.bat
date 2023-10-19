set "scriptPath=%~dp0"
set "targetFolder=wwwroot\csharp-codes"
set "fullPath=%scriptPath%%targetFolder%"
dir /B /A:-D "%fullPath%" > "%scriptPath%wwwroot\codefiles.txt"
