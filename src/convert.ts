import csvToJson from "convert-csv-to-json"
import { writeFileSync } from 'fs';

interface ClassInformation {
  name: string
  subclass?: string
  levels?: number
}



const convertClass = (classString: string, buildNumber: number): ClassInformation[] => {
  const classes = classString.split(',')
  const classInfo = classes.map((singleClass: string) => {
    const regex = /(.*)\s\((.*)\):\s*(\d+)/;
    const match = singleClass.match(regex);
    if (match) {
      const [, name, subclass, levels] = match;
      return {
        name,
        subclass,
        levels: parseInt(levels)
      }
    } else {
       const noSubClassRegex = /(.*):\s*(\d+)/;
        const noSubClassMatch = singleClass.match(noSubClassRegex);
        if (noSubClassMatch) {
          const [, name, levels] = noSubClassMatch;
            return {
              name,
              subclass: null,
              levels: parseInt(levels)
          }
      }
    }

    console.warn('Class parsing issue: ', buildNumber, " ", singleClass)
    return {
      name: singleClass,
      subclass: null,
      levels: null,
    }

  })
  return classInfo
}


const convertRace = (raceString: string, buildNumber: number): string[] => {
  let races = [raceString]
  if (raceString.indexOf(' or ') !== -1) {
    races = raceString.split(' or ')
  }
  else if (raceString.indexOf(',') !== -1) {
    races = raceString.split(',')
  }


  const raceInfo = races.map((race: string) => {
    let transRace = race.trim()
    if (transRace === 'VH') {
      transRace = "V. Human"
    }
    if (transRace === 'CL') {
      transRace = 'Custom Lineage'
    }
    transRace = transRace.replace(', or', '')

    return transRace
  })

  return raceInfo
}

const rawJSON = csvToJson.fieldDelimiter(',').supportQuotedField(true).getJsonFromCsv("./input.csv")
const convertedJSON = rawJSON.map(entry => {
  const buildNumber = parseInt(entry['D&DBuild#'])
  return {
    buildNumber,
    name: entry['Name/Link'],
    overview: entry['Overview'],
    role: entry['Role'],
    races: convertRace(entry['Race'], buildNumber),
    characterClasses: convertClass(entry['Class(Subclass):#ofLevels'], buildNumber)
  }
})

writeFileSync('output.json', JSON.stringify(convertedJSON))
