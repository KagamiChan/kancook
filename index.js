import BSON from 'bson'
import FS from 'fs-extra'
import { promisifyAll } from 'bluebird'

const bson = new BSON()

const fs = promisifyAll(FS)

const readData = async () => {
  const file = await fs.readFileAsync('./data/reciperecords.bson')
  const data = []
  let cur = 0
  while (true) {
    try {
      cur = bson.deserializeStream(file, cur, 1, data, data.length)
    } catch (e) {
      break
    }
    console.log(cur)
  }
  console.log(`converted ${data.length} recipes`)
  await fs.outputJsonAsync('./data/reciperecords.json', data)
}

readData()

