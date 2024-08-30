import * as fs from 'fs';
// @ts-ignore:next-line
import statsJSON from './stats.json'

interface ClassStats {

}


const raceArray:[string, number][] = Object.entries(statsJSON.races);
raceArray.sort((a, b) => b[1] - a[1]);

const raceInfo = raceArray.map(entry => {
  return `<tr><td>${entry[0]}</td><td>${entry[1]}</td></tr>`
})


const classOverview = []
const subClasses = []
Object.keys(statsJSON.classes).forEach(key => {
  classOverview.push([key, statsJSON.classes[key].total, statsJSON.classes[key].totalLevels])
  Object.keys(statsJSON.classes[key]).forEach(subKey => {
    if(!["total","totalLevels","null", "N/A"].includes(subKey)) {
      subClasses.push([key + ' - ' + subKey, statsJSON.classes[key][subKey])
    }
  })
})
classOverview.sort((a, b) => b[1] - a[1]);
subClasses.sort((a, b) => b[1] - a[1]);

const classInfo = classOverview.map(entry => {
  return `<tr><td>${entry[0]}</td><td>${entry[1]}</td><td>${entry[2]}</td></tr>`
})

const subClassInfo = subClasses.map(entry => {
  return `<tr><td>${entry[0]}</td><td>${entry[1]}</td></tr>`
})

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>d4 Data</title>
</head>
<body>
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
    } else {
        console.log('HTML file created successfully.');
    }
});
