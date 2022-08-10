$compilerResponse = Invoke-RestMethod -Uri "https://api.github.com/repos/yanghuan/CSharp.lua/branches/master"
$lastCompilerCommitDate = [datetime]($compilerResponse.commit.commit.author.date)
echo lastCompilerCommitDate: $lastCompilerCommitDate

$webResponse = Invoke-RestMethod -Uri "https://api.github.com/repos/yanghuan/CSharpLuaWeb/commits?path=files%2FCSharp.lua.dll&page=1&per_page=1"
$lastWebCommitDate = [datetime]($webResponse[0].commit.author.date)
echo lastWebCommitDate: $lastWebCommitDate
$isOutDate = $lastWebCommitDate -le $lastCompilerCommitDate
echo "::set-output name=isOutDate::$isOutDate"