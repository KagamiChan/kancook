import BSON from 'bson'
import FS from 'fs-extra'
import { promisifyAll } from 'bluebird'
import _ from 'lodash'

import Recipe from './recipe-model'

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
  }
  console.log(`converted ${data.length} recipes`)

  let recipes = _.uniqWith(data.filter(datum => datum.stage !== -1).map(datum => new Recipe(datum)), (a, b) => _.isEqual(a.identity, b.identity))
  console.log('unique recipes', recipes.length)

  recipes = _.groupBy(recipes, 'recipeId')

  // check itemId
  _.each(recipes, (group) => {
    const itemId = group[0].itemId
    if (!group.every(recipe => recipe.itemId === itemId)) {
      console.log('itemId error', group[0].recipeId)
    }
  })

  let count = 0
  // check cost
  _.forEach(recipes, (group) => {
    const stages = _.groupBy(group, 'stage')
    _.forEach(stages, (stage) => {
      const cost = stage[0].cost
      if (!stage.every(recipe => _.isEqual(recipe.cost, cost))) {
        console.log('cost error', stage[0].recipeId, stage[0].itemId, stage[0].stage)
      }
    })

    const recipeCount = (stages[0] || []).length
    const recipeId = _.get(stages, '0.0.recipeId') || _.get(stages, '1.0.recipeId')
    if (!_.every(stages, stage => stage.length === recipeCount)) {
      console.log('stage count not equal', recipeId, _.map(stages, (stage = []) => stage.length))
      count += 1
    }
  })

  console.log('insufficient records', count)
  const final = {}

  Object.keys(recipes).forEach((group) => {
    final[group] = _.groupBy(recipes[group], 'stage')
  })

  console.log('all records', Object.keys(final).length)

  await fs.outputJson('./data/reciperecords.json', final)
}


const main = async () => {
  try {
    await readData()
  } catch (e) {
    console.error(e.stack)
  }
}

main()
