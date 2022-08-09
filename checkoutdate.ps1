$response = Invoke-RestMethod -Uri "https://api.github.com/repos/yanghuan/CSharp.lua/branches/master"
$lastCommitDate = [datetime]($response.commit.commit.author.date)
echo lastCommitDate: $lastCommitDate
$lastBuildDate = [datetime](Get-ItemProperty -Path ./files/CSharp.lua.dll -Name LastWriteTime).lastwritetime
echo lastBuildDate: $lastBuildDate
$isOutDate = $lastCommitDate -le $lastBuildDate
echo "::set-output name=isOutDate::$isOutDate"