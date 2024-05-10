import { writeFileSync } from 'fs'
import PublicGoogleSheetsParser  from 'public-google-sheets-parser'

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

const convertClass = (classString: string, buildNumber: number): ClassInformation[] => {
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


const convertRace = (raceString: string): string[] => {
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

const spreadsheetId = '18lsjEdNIXayLCUsv9v-Afx-y3MEone2c2EGszBtGw8U'
const parser = new PublicGoogleSheetsParser(spreadsheetId, { sheetName: 'Sheet1', useFormat: true })

parser.parse().then((data) => {
  const convertedJSON: TOCEntry[] = data.map((entry: any):TOCEntry => {
    if (
       !entry['D&D Build #'] ||
       !entry['Name/Link'] ||
       !entry['Overview'] ||
       !entry['Role'] ||
       !entry['Race'] ||
       !entry['Class (Subclass):# of Levels']
    ) {
      console.error('Spreadsheet has changed, this code may not be useful')
      process.exit(1)
    }
    const buildNumber = parseInt(entry['D&D Build #'])
    return {
      buildNumber,
      name: entry['Name/Link'],
      overview: entry['Overview'],
      role: entry['Role'],
      races: convertRace(entry['Race']),
      characterClasses: convertClass(entry['Class (Subclass):# of Levels'], buildNumber)
    }
  })
  writeFileSync('output.json', JSON.stringify(convertedJSON, null, 4))
  console.info('Created output.json')
})
