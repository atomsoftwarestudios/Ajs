echo Cleaning the AJS sources and binary
rd /s /q "%~1\AjsTest\src\ajs"
del "%~1AjsTest\js\ajs.js"
del "%~1AjsTest\js\ajs.d.ts"
del "%~1AjsTest\js\ajs.js.map"
exit 0