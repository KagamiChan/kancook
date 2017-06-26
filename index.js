import BSON from 'bson'
import fs from 'fs-extra'
import _ from 'lodash'

import Recipe from './recipe-model'

const bson = new BSON()

const appendOrSet = (object, path, value) => {
  const v = _.get(object, path)
  if (!value) {
    return
  }
  if (v) {
    _.setWith(object, path, _.sortBy(v.concat(value)), Object)
  } else {
    _.setWith(object, path, [value], Object)
  }
}

const verifyOrSet = (object, path, value) => {
  const v = _.get(object, path)
  if (typeof v === 'undefined') {
    _.setWith(object, path, value, Object)
  } else if (v !== value) {
    console.error('VerifyError', path, value, v)
  }
}

const readData = async () => {
  const file = await fs.readFile('./data/reciperecords.bson')
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

  const recipes = _.uniqWith(
    data.filter(datum => datum.stage !== -1)
    .map(datum => new Recipe(datum)), (a, b) => _.isEqual(a.identity, b.identity))

  console.log('unique recipes', recipes.length)

  // const recipesOrigin = _.clone(recipes)

  const res = {}

  _.each(recipes, (recipe) => {
    const basePath = (recipe.stage === 2 && recipe.upgradeToItemId > 0)
      ? [recipe.itemId, recipe.stage, recipe.secretary, recipe.upgradeToItemId].map(num => String(num))
      : [recipe.itemId, recipe.stage, recipe.secretary].map(num => String(num))
    _.each(['fuel', 'ammo', 'steel', 'bauxite',
      'reqItemId', 'reqItemCount', 'buildkit', 'remodelkit',
      'certainBuildkit', 'certainRemodelkit'], key =>
      verifyOrSet(res, [...basePath, key], recipe[key])
    )
    if (recipe.stage === 2) {
      verifyOrSet(res, [...basePath, 'upgradeToItemLevel'], recipe.upgradeToItemLevel)
    }
    appendOrSet(res, [...basePath, 'day'], recipe.day)
  })

  await fs.outputJson('./data/res.json', res, { spaces: 2 })
  // recipes = _.groupBy(recipes, 'recipeId')

  // // check itemId
  // _.each(recipes, (group) => {
  //   const itemId = group[0].itemId
  //   if (!group.every(recipe => recipe.itemId === itemId)) {
  //     console.log('itemId error', group[0].recipeId)
  //   }
  // })

  // let count = 0
  // // check cost
  // _.forEach(recipes, (group) => {
  //   const stages = _.groupBy(group, 'stage')
  //   _.forEach(stages, (stage) => {
  //     const cost = stage[0].cost
  //     if (!stage.every(recipe => _.isEqual(recipe.cost, cost))) {
  //       console.log('cost error', stage[0].recipeId, stage[0].itemId, stage[0].stage)
  //     }
  //   })

  //   const recipeCount = (stages[0] || []).length
  //   const recipeId = _.get(stages, '0.0.recipeId') || _.get(stages, '1.0.recipeId') || _.get(stages, '2.0.recipeId')
  //   const itemName = _.get(stages, '0.0.itemName') || _.get(stages, '1.0.itemName') || _.get(stages, '2.0.itemName')
  //   if (!_.every(stages, stage => stage.length === recipeCount)) {
  //     console.log('stage count not equal', recipeId, itemName, _.map(stages, (stage = []) => stage.length))
  //     count += 1
  //   }
  // })

  // console.log('insufficient records', count)
  // const final = {}

  // Object.keys(recipes).forEach((group) => {
  //   final[group] = _.groupBy(recipes[group], 'stage')
  // })

  // console.log('all records', Object.keys(final).length)
  // console.log('by itemId', Object.keys(_.groupBy(recipesOrigin, 'itemId')).length)

  // await fs.outputJson('./data/reciperecords.json', final, { spaces: 2 })
}


const main = async () => {
  try {
    await readData()
  } catch (e) {
    console.error(e.stack)
  }
}

main()
