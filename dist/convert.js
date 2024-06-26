"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const public_google_sheets_parser_1 = __importDefault(require("public-google-sheets-parser"));
const dictionary_json_1 = __importDefault(require("./dictionary.json"));
var TranslationTypes;
(function (TranslationTypes) {
    TranslationTypes["Classes"] = "classes";
    TranslationTypes["Races"] = "races";
})(TranslationTypes || (TranslationTypes = {}));
const convertClass = (classString, buildNumber) => {
    if (!classString) {
        return [];
    }
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
            const noSubClassRegex = /(.*):\s*(\d+)/;
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
const translate = (source, type) => {
    if (source in dictionary_json_1.default[type]) {
        return dictionary_json_1.default[type][source];
    }
    return source;
};
const convertRace = (raceString) => {
    if (!raceString) {
        return [];
    }
    let races = [raceString];
    if (raceString.indexOf(' or ') !== -1) {
        races = raceString.split(' or ');
    }
    else if (raceString.indexOf(',') !== -1) {
        races = raceString.split(',');
    }
    const raceInfo = races.map((race) => {
        let transRace = translate(race.trim(), TranslationTypes.Races);
        transRace = transRace.replace(', or', '');
        return transRace;
    });
    return raceInfo;
};
const spreadsheetId = '18lsjEdNIXayLCUsv9v-Afx-y3MEone2c2EGszBtGw8U';
const parser = new public_google_sheets_parser_1.default(spreadsheetId, { sheetName: 'Sheet1', useFormat: true });
parser.parse().then((data) => {
    const convertedJSON = data.map((entry) => {
        const buildNumber = parseInt(entry['D&D Build #']);
        return {
            buildNumber,
            name: entry['Name/Link'],
            overview: entry['Overview'],
            role: entry['Role'],
            races: convertRace(entry['Race']),
            characterClasses: convertClass(entry['Class (Subclass):# of Levels'], buildNumber)
        };
    });
    (0, fs_1.writeFileSync)('output.json', JSON.stringify(convertedJSON, null, 4));
    console.info('Created output.json');
});
//# sourceMappingURL=convert.js.map