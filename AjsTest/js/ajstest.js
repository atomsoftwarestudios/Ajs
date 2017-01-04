/* *************************************************************************
The MIT License (MIT)
Copyright (c)2016-2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */
var testfw;
(function (testfw) {
    "use strict";
    var Test = (function () {
        function Test() {
        }
        Test.init = function () {
            Test._testGroups = {};
            Test._report = [];
            Test._currentTest = null;
            Test.log("AJSTest v.1.00");
            Test.log("Copyright (c)2017 Atom Software Studios, released under MIT license");
            Test.log("");
            Test.log("Commands: ");
            Test.log("");
            Test.log("   test.list()                     Lists all tests and groups");
            Test.log("   test.run(name: string)          Runs a specific test");
            Test.log("   test.group(name: string)        Runs all test in the specific group");
            Test.log("   test.all()                      Runs all tests");
            Test.log("   test.report()                   Generates the report for the last test");
            Test.log("   test.auto()                     Runs all tests and generates the final report");
            Test.log("");
            Test.log("Hit F5 to reload and clean everything completely");
        };
        Test.loadScript = function (url, callback) {
            return;
        };
        Test.register = function (group, description, continueIfFails, testFn) {
            var testCase = {
                group: group,
                name: Test._getFunctionName(testFn),
                description: description,
                continue: continueIfFails,
                testFn: testFn
            };
            if (!Test._testGroups.hasOwnProperty(testCase.group)) {
                Test._testGroups[testCase.group] = [];
            }
            Test._testGroups[testCase.group].push(testCase);
        };
        Test._getFunctionName = function (fn) {
            return fn.toString().match(/function\s*(\w+)/)[1];
        };
        Test._list = function () {
            Test.log("List of registered tests:");
            for (var key in Test._testGroups) {
                if (Test._testGroups.hasOwnProperty(key)) {
                    for (var i = 0; i < Test._testGroups[key].length; i++) {
                        var rec = "";
                        rec += Test._stringLength(Test._testGroups[key][i].group, 15);
                        rec += Test._stringLength(Test._testGroups[key][i].name, 40);
                        rec += Test._testGroups[key][i].description;
                        Test.log(rec);
                    }
                }
            }
        };
        Test._findTest = function (name) {
            for (var key in Test._testGroups) {
                if (Test._testGroups.hasOwnProperty(key)) {
                    for (var i = 0; i < Test._testGroups[key].length; i++) {
                        if (Test._testGroups[key][i].name === name) {
                            return Test._testGroups[key][i];
                        }
                    }
                }
            }
            return null;
        };
        Test._stringLength = function (str, len) {
            if (len > 60) {
                len = 60;
            }
            return (str + "                                                            ").substr(0, len);
        };
        Test._run = function (testCase) {
            Test.log("Running test: [" + testCase.name + "]");
            Test._currentTest = testCase;
            var result = testCase.testFn();
            Test._currentTest = null;
            if (result || (!result && testCase.group === "testfw")) {
                Test.log("Test [" + testCase.name + "] PASSED");
            }
            else {
                Test.error("Test [" + testCase.name + "] FAILED");
            }
            Test._report.push({
                date: new Date(),
                testCase: testCase,
                result: result,
                details: Test._details
            });
            delete (Test._details);
            return result;
        };
        Test._group = function (groupName) {
            var result = true;
            for (var i = 0; i < Test._testGroups[groupName].length; i++) {
                var r = Test._run(Test._testGroups[groupName][i]);
                result = result && r;
                if (!r && !Test._testGroups[groupName][i].continue) {
                    return false;
                }
            }
            return result;
        };
        Test._all = function () {
            var result = true;
            if (Test._testGroups.hasOwnProperty("testfw")) {
                if (Test._group("testfw")) {
                    Test.log("Something is wrong with the test framework!");
                    return false;
                }
            }
            for (var key in Test._testGroups) {
                if (Test._testGroups.hasOwnProperty(key) && key !== "testfw") {
                    for (var i = 0; i < Test._testGroups[key].length; i++) {
                        var r = Test._run(Test._testGroups[key][i]);
                        result = result && r;
                        if (!r && !Test._testGroups[key][i].continue) {
                            return false;
                        }
                    }
                }
            }
            return result;
        };
        Test._generateReport = function () {
            document.body.innerHTML = "";
            var div = document.createElement("div");
            div.setAttribute("class", "navbar");
            var chb = document.createElement("input");
            chb.type = "checkbox";
            chb.value = "value";
            chb.id = "checkbox";
            chb.checked = false;
            div.appendChild(chb);
            var lbl = document.createElement("label");
            lbl.htmlFor = "checkbox";
            lbl.innerHTML = "Show details";
            div.appendChild(lbl);
            document.body.appendChild(div);
            div = document.createElement("div");
            div.setAttribute("class", "note");
            div.innerHTML = "To manually control the testFW open the JavaScript console (F12) and refresh the page (F5)";
            document.body.appendChild(div);
            chb.addEventListener("click", function (event) {
                var chb = event.target;
                var tags = document.getElementsByClassName("details");
                for (var i = 0; i < tags.length; i++) {
                    tags.item(i).setAttribute("style", chb.checked ? "display: auto:" : "display: none");
                }
            });
            for (var group in Test._testGroups) {
                if (Test._testGroups.hasOwnProperty(group)) {
                    for (var i = 0; i < Test._report.length; i++) {
                        if (Test._report[i].testCase.group === group) {
                            Test._genGroupReport(group);
                            break;
                        }
                    }
                }
            }
        };
        Test._genGroupReport = function (groupName) {
            var tr;
            var td;
            var th;
            var cap = document.createElement("h2");
            cap.innerHTML = groupName;
            var table = document.createElement("table");
            table.setAttribute("cellpadding", "0");
            table.setAttribute("cellspacing", "0");
            tr = document.createElement("tr");
            th = document.createElement("th");
            th.innerText = "Date / Time";
            tr.appendChild(th);
            tr.appendChild(th);
            th = document.createElement("th");
            th.innerText = "Test name";
            tr.appendChild(th);
            th = document.createElement("th");
            th.innerText = "Test description";
            tr.appendChild(th);
            th = document.createElement("th");
            th.innerText = "Test result";
            tr.appendChild(th);
            table.appendChild(tr);
            for (var i = 0; i < Test._report.length; i++) {
                if (Test._report[i].testCase.group === groupName) {
                    tr = document.createElement("tr");
                    td = document.createElement("td");
                    td.innerText = Test._report[i].date.toLocaleDateString() + " " + Test._report[i].date.toLocaleTimeString();
                    tr.appendChild(td);
                    td = document.createElement("td");
                    td.innerText = Test._report[i].testCase.name;
                    tr.appendChild(td);
                    td = document.createElement("td");
                    td.innerText = Test._report[i].testCase.description;
                    tr.appendChild(td);
                    td = document.createElement("td");
                    td.innerText = Test._report[i].result ? "PASSED" : "FAILED";
                    td.style.backgroundColor = Test._report[i].result ? "green" : "red";
                    tr.appendChild(td);
                    table.appendChild(tr);
                    if (Test._report[i].details !== undefined) {
                        tr = document.createElement("tr");
                        tr.setAttribute("class", "details");
                        tr.setAttribute("style", "display: none");
                        td = document.createElement("td");
                        td.setAttribute("colspan", "5");
                        var pre = document.createElement("pre");
                        pre.innerText = Test._report[i].details.join("\n");
                        td.appendChild(pre);
                        tr.appendChild(td);
                        table.appendChild(tr);
                    }
                }
            }
            document.body.appendChild(cap);
            document.body.appendChild(table);
        };
        Test.log = function (message) {
            if (Test._currentTest !== null) {
                if (Test._details === undefined) {
                    Test._details = [];
                }
                Test._details.push("INFO: " + message);
                console.log("TESTFW [" + Test._currentTest.name + "]: " + message);
            }
            else {
                console.log("TESTFW: " + message);
            }
        };
        Test.warn = function (message) {
            if (Test._currentTest !== null) {
                if (Test._details === undefined) {
                    Test._details = [];
                }
                Test._details.push("WARN: " + message);
                console.log("TESTFW [" + Test._currentTest.name + "]: " + message);
            }
            else {
                console.warn("TESTFW: " + message);
            }
        };
        Test.error = function (message) {
            if (Test._currentTest !== null) {
                if (Test._details === undefined) {
                    Test._details = [];
                }
                Test._details.push("ERR:  " + message);
                console.log("TESTFW [" + Test._currentTest.name + "]: " + message);
            }
            else {
                console.error("TESTFW: " + message);
            }
        };
        Test.list = function () {
            Test._list();
            return "Done.";
        };
        Test.run = function (name) {
            Test._report = [];
            var testCase = Test._findTest(name);
            if (testCase === null) {
                Test.error("Test is not registered!");
                return false;
            }
            if (Test._run(testCase)) {
                Test.log("Passed");
                return true;
            }
            else {
                Test.log("Failed");
                return false;
            }
        };
        Test.group = function (groupName) {
            Test._report = [];
            if (!Test._testGroups.hasOwnProperty(groupName)) {
                Test.error("Test group not exist!");
                return false;
            }
            if (Test._group(groupName)) {
                Test.log("Passed");
                return true;
            }
            else {
                Test.error("Failed");
                return false;
            }
        };
        Test.all = function () {
            Test._report = [];
            if (Test._all()) {
                Test.log("Passed");
                return true;
            }
            else {
                Test.error("Failed");
                return false;
            }
        };
        Test.report = function () {
            Test._generateReport();
            return "Done.";
        };
        Test.auto = function () {
            Test._report = [];
            var result = Test._all();
            Test._generateReport();
            if (result) {
                Test.log("Passed");
                return true;
            }
            else {
                Test.error("Failed");
                return false;
            }
        };
        return Test;
    }());
    testfw.Test = Test;
    Test.init();
})(testfw || (testfw = {}));
var test = testfw.Test;
test.log("TestFW is ready");
test.log("");
/* *************************************************************************
The MIT License (MIT)
Copyright (c)2016-2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */
///<reference path="TestFw.ts" />
window.onload = function () {
    testfw.Test.auto();
};
/* *************************************************************************
The MIT License (MIT)
Copyright (c)2016-2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */
///<reference path="../TestFw.ts" />
var testfw;
(function (testfw) {
    var cases;
    (function (cases) {
        "use strict";
        var test = testfw.Test;
        test.register("testfw", "Always passes if called, just to be sure testFW works correctly", true, function passAlways() {
            test.log("Test log");
            test.warn("Test warn");
            test.error("Test err");
            return true;
        });
        test.register("testfw", "Always fails if called, just to be sure testFW works correctly", true, function failsAlways() {
            test.log("Test log");
            test.warn("Test warn");
            test.error("Test err");
            return false;
        });
    })(cases = testfw.cases || (testfw.cases = {}));
})(testfw || (testfw = {}));
/* *************************************************************************
The MIT License (MIT)
Copyright (c)2016-2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */
///<reference path="../TestFw.ts" />
///<reference path="testfw.ts" />
var testfw;
(function (testfw) {
    var cases;
    (function (cases) {
        "use strict";
    })(cases = testfw.cases || (testfw.cases = {}));
})(testfw || (testfw = {}));
/* *************************************************************************
The MIT License (MIT)
Copyright (c)2016-2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */
///<reference path="../TestFw.ts" />
///<reference path="testfw.ts" />
var testfw;
(function (testfw) {
    var cases;
    (function (cases) {
        "use strict";
        var test = testfw.Test;
        test.register("base", "Tests if the framework is loaded", false, function frameworkLoaded() {
            return typeof ajs !== "undefined";
        });
    })(cases = testfw.cases || (testfw.cases = {}));
})(testfw || (testfw = {}));
/* *************************************************************************
The MIT License (MIT)
Copyright (c)2016-2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */
///<reference path="../TestFw.ts" />
///<reference path="testfw.ts" />
var testfw;
(function (testfw) {
    var cases;
    (function (cases) {
        "use strict";
    })(cases = testfw.cases || (testfw.cases = {}));
})(testfw || (testfw = {}));
/* *************************************************************************
The MIT License (MIT)
Copyright (c)2016-2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */
///<reference path="../TestFw.ts" />
///<reference path="testfw.ts" />
var testfw;
(function (testfw) {
    var cases;
    (function (cases) {
        "use strict";
    })(cases = testfw.cases || (testfw.cases = {}));
})(testfw || (testfw = {}));
/* *************************************************************************
The MIT License (MIT)
Copyright (c)2016-2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */
///<reference path="../TestFw.ts" />
///<reference path="testfw.ts" />
var testfw;
(function (testfw) {
    var cases;
    (function (cases) {
        "use strict";
    })(cases = testfw.cases || (testfw.cases = {}));
})(testfw || (testfw = {}));
/* *************************************************************************
The MIT License (MIT)
Copyright (c)2016-2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */
///<reference path="../TestFw.ts" />
///<reference path="testfw.ts" />
var testfw;
(function (testfw) {
    var cases;
    (function (cases) {
        "use strict";
    })(cases = testfw.cases || (testfw.cases = {}));
})(testfw || (testfw = {}));
/* *************************************************************************
The MIT License (MIT)
Copyright (c)2016-2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */
///<reference path="../TestFw.ts" />
///<reference path="testfw.ts" />
var testfw;
(function (testfw) {
    var cases;
    (function (cases) {
        "use strict";
    })(cases = testfw.cases || (testfw.cases = {}));
})(testfw || (testfw = {}));
/* *************************************************************************
The MIT License (MIT)
Copyright (c)2016-2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */
///<reference path="../TestFw.ts" />
///<reference path="testfw.ts" />
var testfw;
(function (testfw) {
    var cases;
    (function (cases) {
        "use strict";
    })(cases = testfw.cases || (testfw.cases = {}));
})(testfw || (testfw = {}));
/* *************************************************************************
The MIT License (MIT)
Copyright (c)2016-2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */
///<reference path="../TestFw.ts" />
///<reference path="testfw.ts" />
var testfw;
(function (testfw) {
    var cases;
    (function (cases) {
        "use strict";
    })(cases = testfw.cases || (testfw.cases = {}));
})(testfw || (testfw = {}));
//# sourceMappingURL=/js/ajstest.js.map