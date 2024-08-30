import { writeFileSync } from 'fs'
import PublicGoogleSheetsParser  from 'public-google-sheets-parser'
import translationJSON from './dictionary.json'


interface ClassInformation {
  name: string
  subclass?: string
  levels?: number
}

interface TOCEntry {
  buildNumber: number
  name: string
  overview: string
  role: string
  races: string[]
  characterClasses: ClassInformation[]
}

enum TranslationTypes {
  Classes = "classes",
  Races = "races",
  Subclasses = "subclasses"
}

interface Stats {
  races: any
  classes: any
}

const stats:Stats = {
  races: {},
  classes: {}
}


const buildsToSkip: number[] = [126,168]

const convertClass = (classString: string, buildNumber: number, stats: Stats): ClassInformation[] => {
  if (!classString) {
    return []
  }
  const classes = classString.split(',')
  const classInfo = classes.map((singleClass: string) => {
    const regex = /(.*)\s\((.*)\):\s*(\d+)/;
    const match = singleClass.match(regex);
    if (match) {
      const [, name, subclass, levels] = match;
      return {
        name: translate(name, TranslationTypes.Classes),
        subclass: translate(subclass, TranslationTypes.Subclasses),
        levels: parseInt(levels)
      }
    } else {
       const noSubClassRegex = /(.*):\s*(\d+)/;
        const noSubClassMatch = singleClass.match(noSubClassRegex);
        if (noSubClassMatch) {
          const [, name, levels] = noSubClassMatch;
            return {
              name: translate(name, TranslationTypes.Classes),
              subclass: null,
              levels: parseInt(levels)
          }
      }
    }

    console.warn('Class parsing issue: ', buildNumber, " ", singleClass)
    return {
      name: translate(singleClass, TranslationTypes.Classes),
      subclass: null,
      levels: null,
    }

  })
  classInfo.forEach((entry: ClassInformation) => {
    if (stats.classes[entry.name]) {
      stats.classes[entry.name].total++
      stats.classes[entry.name].totalLevels += entry.levels
      if (stats.classes[entry.name][entry.subclass]) {
        stats.classes[entry.name][entry.subclass]++
      } else {
          stats.classes[entry.name] = {
            ...stats.classes[entry.name],
            [entry.subclass]: 1
          }
        }
    } else {
      stats.classes[entry.name] = {
        total: 1,
        totalLevels: entry.levels,
        [entry.subclass]: 1
      }
    }
  })

  return classInfo
}


const translate = (source: string, type: TranslationTypes): string => {
  if(source.trim() in translationJSON[type]) {
    return translationJSON[type][source.trim()]
  }
  return source.trim()
}

const convertRace = (raceString: string, stats: Stats): string[] => {
  if (!raceString) {
    return []
  }
  let races = [raceString]

  if (raceString.indexOf(' or ') !== -1) {
    races = raceString.split(' or ')
  }
  else if (raceString.indexOf(',') !== -1) {
    races = raceString.split(',')
  }


  const raceInfo = races.map((race: string) => {
    let transRace = translate(race, TranslationTypes.Races)
    transRace = transRace.replace(', or', '')
    if (stats.races[transRace]) {
      stats.races[transRace]++
    } else {
      stats.races[transRace] = 1
    }
    return transRace
  })

  return raceInfo
}

const spreadsheetId = '18lsjEdNIXayLCUsv9v-Afx-y3MEone2c2EGszBtGw8U'
const parser = new PublicGoogleSheetsParser(spreadsheetId, { sheetName: 'Sheet1', useFormat: true })

parser.parse().then((data) => {
  const convertedJSON: TOCEntry[] = data.map((entry: any):TOCEntry => {

    const buildNumber = parseInt(entry['D&D Build #'])
    if (buildsToSkip.includes(buildNumber)) {
      return
    }

    return {
      buildNumber,
      name: entry['Name/Link'],
      overview: entry['Overview'],
      role: entry['Role'],
      races: convertRace(entry['Race'], stats),
      characterClasses: convertClass(entry['Class (Subclass):# of Levels'], buildNumber, stats)
    }
  }).filter(entry => entry)
  writeFileSync('output.json', JSON.stringify(convertedJSON, null, 4))
  writeFileSync('stats.json', JSON.stringify(stats, null, 4))
  console.info('Created JSON')
})
