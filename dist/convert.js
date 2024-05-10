"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const convert_csv_to_json_1 = __importDefault(require("convert-csv-to-json"));
const fs_1 = require("fs");
const convertClass = (classString, buildNumber) => {
    const classes = classString.split(',');
    const classInfo = classes.map((singleClass) => {
        const regex = /(.*)\s\((.*)\):\s*(\d+)/;
        const match = singleClass.match(regex);
        if (match) {
            const [, name, subclass, levels] = match;
            return {
                name,
                subclass,
                levels: parseInt(levels)
            };
        }
        else {
            const noSubClassRegex = /(.*):(\d+)/;
            const noSubClassMatch = singleClass.match(noSubClassRegex);
            if (noSubClassMatch) {
                const [, name, levels] = noSubClassMatch;
                return {
                    name,
                    subclass: null,
                    levels: parseInt(levels)
                };
            }
        }
        console.warn('Class parsing issue: ', buildNumber, " ", singleClass);
        return {
            name: singleClass,
            subclass: null,
            levels: null,
        };
    });
    return classInfo;
};
const convertRace = (raceString, buildNumber) => {
    let races = [raceString];
    if (raceString.indexOf(' or ') !== -1) {
        races = raceString.split(' or ');
    }
    else if (raceString.indexOf(',') !== -1) {
        races = raceString.split(',');
    }
    const raceInfo = races.map((race) => {
        let transRace = race.trim();
        if (transRace === 'VH') {
            transRace = "V. Human";
        }
        if (transRace === 'CL') {
            transRace = 'Custom Lineage';
        }
        transRace = transRace.replace(', or', '');
        return transRace;
    });
    return raceInfo;
};
const rawJSON = convert_csv_to_json_1.default.fieldDelimiter(',').supportQuotedField(true).getJsonFromCsv("./input.csv");
const convertedJSON = rawJSON.map(entry => {
    const buildNumber = parseInt(entry['D&DBuild#']);
    return {
        buildNumber,
        name: entry['Name/Link'],
        overview: entry['Overview'],
        role: entry['Role'],
        races: convertRace(entry['Race'], buildNumber),
        characterClasses: convertClass(entry['Class(Subclass):#ofLevels'], buildNumber)
    };
});
(0, fs_1.writeFileSync)('output.json', JSON.stringify(convertedJSON));
//# sourceMappingURL=convert.js.map