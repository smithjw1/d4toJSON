"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
// @ts-ignore:next-line
const stats_json_1 = __importDefault(require("./stats.json"));
const raceArray = Object.entries(stats_json_1.default.races);
raceArray.sort((a, b) => b[1] - a[1]);
const raceInfo = raceArray.map(entry => {
    return `<tr><td>${entry[0]}</td><td>${entry[1]}</td></tr>`;
});
const classOverview = [];
const subClasses = [];
Object.keys(stats_json_1.default.classes).forEach(key => {
    classOverview.push([key, stats_json_1.default.classes[key].total, stats_json_1.default.classes[key].totalLevels]);
    Object.keys(stats_json_1.default.classes[key]).forEach(subKey => {
        if (!["total", "totalLevels", "null", "N/A"].includes(subKey)) {
            subClasses.push([key + ' - ' + subKey, stats_json_1.default.classes[key][subKey]]);
        }
    });
});
classOverview.sort((a, b) => b[1] - a[1]);
subClasses.sort((a, b) => b[1] - a[1]);
const classInfo = classOverview.map(entry => {
    return `<tr><td>${entry[0]}</td><td>${entry[1]}</td><td>${entry[2]}</td></tr>`;
});
const subClassInfo = subClasses.map(entry => {
    return `<tr><td>${entry[0]}</td><td>${entry[1]}</td></tr>`;
});
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>d4 Data</title>
    <link rel="stylesheet" href="https://unpkg.com/marx-css/css/marx.min.css">
</head>
<body style="margin:1vh 10%">
    <h1>Data from D4</h1>
    <h2>Races</h2>
    <table>
    <tr><th>Race</th><th>Count</th></tr>
    ${raceInfo.join('')}
    </table>
    <h2>Classes</h2>
    <table>
    <tr><th>Class</th><th>Count</th><th>Total Levels</th></tr>
    ${classInfo.join('')}
    </table>
    <h2>Subclasses</h2>
    <table>
    <tr><th>Subclass</th><th>Count</th></tr>
    ${subClassInfo.join('')}
    </table>
</body>
</html>
`;
fs.writeFile('data.html', htmlContent, (err) => {
    if (err) {
        console.error('Error writing file:', err);
    }
    else {
        console.log('HTML file created successfully.');
    }
});
//# sourceMappingURL=chart.js.map