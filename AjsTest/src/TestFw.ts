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

namespace testfw {

    "use strict";

    export interface ITestFn {
        (): boolean;
    }

    export interface ITestCase {
        group: string;
        name: string;
        description: string;
        continue: boolean;
        testFn: ITestFn;
    }

    export interface ITestGroups {
        [key: string]: ITestCase[];
    }

    export interface IReportRecord {
        date: Date;
        testCase: ITestCase;
        result: boolean;
        details?: string[];
    }

    export class Test {

        protected static _testGroups: testfw.ITestGroups;
        protected static _report: testfw.IReportRecord[];
        protected static _currentTest: testfw.ITestCase;
        protected static _details: string[];

        public static init(): void {
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
        }

        public static loadScript(url: string, callback: Function): void {
            return;
        }

        public static register(group: string, description: string, continueIfFails: boolean, testFn: ITestFn): void {

            let testCase: ITestCase = {
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
        }

        protected static _getFunctionName(fn: Function): string {
            return fn.toString().match(/function\s*(\w+)/)[1];
        }

        protected static _list(): void {
            Test.log("List of registered tests:");
            for (var key in Test._testGroups) {
                if (Test._testGroups.hasOwnProperty(key)) {
                    for (let i: number = 0; i < Test._testGroups[key].length; i++) {
                        let rec: string = "";
                        rec += Test._stringLength(Test._testGroups[key][i].group, 15);
                        rec += Test._stringLength(Test._testGroups[key][i].name, 40);
                        rec += Test._testGroups[key][i].description;
                        Test.log(rec);
                    }
                }
            }
        }

        protected static _findTest(name: string): testfw.ITestCase {
            for (var key in Test._testGroups) {
                if (Test._testGroups.hasOwnProperty(key)) {
                    for (let i: number = 0; i < Test._testGroups[key].length; i++) {
                        if (Test._testGroups[key][i].name === name) {
                            return Test._testGroups[key][i];
                        }
                    }
                }
            }
            return null;
        }

        protected static _stringLength(str: string, len: number): string {
            if (len > 60) { len = 60; }
            return (str + "                                                            ").substr(0, len);
        }

        protected static _run(testCase: testfw.ITestCase): boolean {
            Test.log("Running test: [" + testCase.name + "]");
            Test._currentTest = testCase;
            let result: boolean = testCase.testFn();
            Test._currentTest = null;
            if (result || (!result && testCase.group === "testfw")) {
                Test.log("Test [" + testCase.name + "] PASSED");
            } else {
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
        }

        protected static _group(groupName: string): boolean {
            let result: boolean = true;
            for (let i: number = 0; i < Test._testGroups[groupName].length; i++) {
                let r: boolean = Test._run(Test._testGroups[groupName][i]);
                result = result && r;
                if (!r && !Test._testGroups[groupName][i].continue) {
                    return false;
                }
            }
            return result;
        }

        protected static _all(): boolean {

            let result: boolean = true;

            if (Test._testGroups.hasOwnProperty("testfw")) {
                if (Test._group("testfw")) {
                    Test.log("Something is wrong with the test framework!");
                    return false;
                }
            }

            for (var key in Test._testGroups) {
                if (Test._testGroups.hasOwnProperty(key) && key !== "testfw") {
                    for (let i: number = 0; i < Test._testGroups[key].length; i++) {
                        let r: boolean = Test._run(Test._testGroups[key][i]);
                        result = result && r;
                        if (!r && !Test._testGroups[key][i].continue) {
                            return false;
                        }
                    }
                }
            }

            return result;
        }

        protected static _generateReport(): void {

            document.body.innerHTML = "";

            let div: HTMLDivElement = document.createElement("div");
            div.setAttribute("class", "navbar");

            let chb: HTMLInputElement = document.createElement("input");
            chb.type = "checkbox";
            chb.value = "value";
            chb.id = "checkbox";
            chb.checked = false;
            div.appendChild(chb);

            let lbl: HTMLLabelElement = document.createElement("label");
            lbl.htmlFor = "checkbox";
            lbl.innerHTML = "Show details";
            div.appendChild(lbl);
            document.body.appendChild(div);

            div = document.createElement("div");
            div.setAttribute("class", "note");
            div.innerHTML = "To manually control the testFW open the JavaScript console (F12) and refresh the page (F5)";
            document.body.appendChild(div);

            chb.addEventListener("click", (event: Event) => {
                let chb: HTMLInputElement = event.target as HTMLInputElement;

                let tags: HTMLCollectionOf<Element> = document.getElementsByClassName("details");
                for (let i: number = 0; i < tags.length; i++) {
                    tags.item(i).setAttribute("style", chb.checked ? "display: auto:" : "display: none");
                }

            });

            for (var group in Test._testGroups) {
                if (Test._testGroups.hasOwnProperty(group)) {
                    for (let i: number = 0; i < Test._report.length; i++) {
                        if (Test._report[i].testCase.group === group) {
                            Test._genGroupReport(group);
                            break;
                        }
                    }

                }
            }

        }

        protected static _genGroupReport(groupName: string): void {
            let tr: HTMLElement;
            let td: HTMLElement;
            let th: HTMLElement;

            let cap: HTMLHeadingElement = document.createElement("h2");
            cap.innerHTML = groupName;

            let table: HTMLElement = document.createElement("table");
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

            for (let i: number = 0; i < Test._report.length; i++) {
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
                        let pre: HTMLElement = document.createElement("pre");
                        pre.innerText = Test._report[i].details.join("\n");
                        td.appendChild(pre);
                        tr.appendChild(td);
                        table.appendChild(tr);
                    }
                }
            }

            document.body.appendChild(cap);
            document.body.appendChild(table);
        }

        public static log(message: string): void {
            if (Test._currentTest !== null) {
                if (Test._details === undefined) {
                    Test._details = [];
                }
                Test._details.push("INFO: " + message);
                console.log("TESTFW [" + Test._currentTest.name + "]: " + message);
            } else {
                console.log("TESTFW: " + message);
            }
        }

        public static warn(message: string): void {
            if (Test._currentTest !== null) {
                if (Test._details === undefined) {
                    Test._details = [];
                }
                Test._details.push("WARN: " + message);
                console.log("TESTFW [" + Test._currentTest.name + "]: " + message);
            } else {
                console.warn("TESTFW: " + message);
            }
        }

        public static error(message: string): void {
            if (Test._currentTest !== null) {
                if (Test._details === undefined) {
                    Test._details = [];
                }
                Test._details.push("ERR:  " + message);
                console.log("TESTFW [" + Test._currentTest.name + "]: " + message);
            } else {
                console.error("TESTFW: " + message);
            }
        }

        public static list(): string {
            Test._list();
            return "Done.";
        }

        public static run(name: string): boolean {
            Test._report = [];

            let testCase: testfw.ITestCase = Test._findTest(name);
            if (testCase === null) {
                Test.error("Test is not registered!");
                return false;
            }

            if (Test._run(testCase)) {
                Test.log("Passed");
                return true;
            } else {
                Test.log("Failed");
                return false;
            }
        }

        public static group(groupName: string): boolean {
            Test._report = [];

            if (!Test._testGroups.hasOwnProperty(groupName)) {
                Test.error("Test group not exist!");
                return false;
            }

            if (Test._group(groupName)) {
                Test.log("Passed");
                return true;
            } else {
                Test.error("Failed");
                return false;
            }
        }

        public static all(): boolean {
            Test._report = [];

            if (Test._all()) {
                Test.log("Passed");
                return true;
            } else {
                Test.error("Failed");
                return false;
            }
        }

        public static report(): string {
            Test._generateReport();
            return "Done.";
        }

        public static auto(): boolean {
            Test._report = [];
            let result: boolean = Test._all();
            Test._generateReport();
            if (result) {
                Test.log("Passed");
                return true;
            } else {
                Test.error("Failed");
                return false;
            }
        }
    }

    Test.init();

}

var test: any =  testfw.Test;
test.log("TestFW is ready");
test.log("");