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
    TranslationTypes["Subclasses"] = "subclasses";
})(TranslationTypes || (TranslationTypes = {}));
const stats = {
    races: {},
    classes: {}
};
const buildsToSkip = [126, 168];
const convertClass = (classString, buildNumber, stats) => {
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
                name: translate(name, TranslationTypes.Classes),
                subclass: translate(subclass, TranslationTypes.Subclasses),
                levels: parseInt(levels)
            };
        }
        else {
            const noSubClassRegex = /(.*):\s*(\d+)/;
            const noSubClassMatch = singleClass.match(noSubClassRegex);
            if (noSubClassMatch) {
                const [, name, levels] = noSubClassMatch;
                return {
                    name: translate(name, TranslationTypes.Classes),
                    subclass: null,
                    levels: parseInt(levels)
                };
            }
        }
        console.warn('Class parsing issue: ', buildNumber, " ", singleClass);
        return {
            name: translate(singleClass, TranslationTypes.Classes),
            subclass: null,
            levels: null,
        };
    });
    classInfo.forEach((entry) => {
        if (stats.classes[entry.name]) {
            stats.classes[entry.name].total++;
            stats.classes[entry.name].totalLevels += entry.levels;
            if (stats.classes[entry.name][entry.subclass]) {
                stats.classes[entry.name][entry.subclass]++;
            }
            else {
                stats.classes[entry.name] = Object.assign(Object.assign({}, stats.classes[entry.name]), { [entry.subclass]: 1 });
            }
        }
        else {
            stats.classes[entry.name] = {
                total: 1,
                totalLevels: entry.levels,
                [entry.subclass]: 1
            };
        }
    });
    return classInfo;
};
const translate = (source, type) => {
    if (source.trim() in dictionary_json_1.default[type]) {
        return dictionary_json_1.default[type][source.trim()];
    }
    return source.trim();
};
const convertRace = (raceString, stats) => {
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
        let transRace = translate(race, TranslationTypes.Races);
        transRace = transRace.replace(', or', '');
        if (stats.races[transRace]) {
            stats.races[transRace]++;
        }
        else {
            stats.races[transRace] = 1;
        }
        return transRace;
    });
    return raceInfo;
};
const spreadsheetId = '18lsjEdNIXayLCUsv9v-Afx-y3MEone2c2EGszBtGw8U';
const parser = new public_google_sheets_parser_1.default(spreadsheetId, { sheetName: 'Sheet1', useFormat: true });
parser.parse().then((data) => {
    const convertedJSON = data.map((entry) => {
        const buildNumber = parseInt(entry['D&D Build #']);
        if (buildsToSkip.includes(buildNumber)) {
            return;
        }
        return {
            buildNumber,
            name: entry['Name/Link'],
            overview: entry['Overview'],
            role: entry['Role'],
            races: convertRace(entry['Race'], stats),
            characterClasses: convertClass(entry['Class (Subclass):# of Levels'], buildNumber, stats)
        };
    }).filter(entry => entry);
    (0, fs_1.writeFileSync)('output.json', JSON.stringify(convertedJSON, null, 4));
    (0, fs_1.writeFileSync)('stats.json', JSON.stringify(stats, null, 4));
    console.info('Created JSON');
});
//# sourceMappingURL=convert.js.map