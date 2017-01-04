echo Copying AJS sources to target directory
mkdir "%~1AjsTest\src\ajs"
xcopy /D "%~1Ajs\js\*" "%~1AjsTest\js"
xcopy /s /e /D "%~1Ajs\src\*" "%~1\AjsTest\src\ajs" 
echo "%~1Ajs\src\*"