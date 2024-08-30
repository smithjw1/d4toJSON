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
const stats_json_1 = __importDefault(require("../stats.json"));
const tableify_1 = __importDefault(require("@tillhub/tableify"));
console.log(stats_json_1.default);
const html = (0, tableify_1.default)(stats_json_1.default.races);
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>d4 Data</title>
</head>
<body>
    <h1>Data from D4</h1>
    ${html}
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