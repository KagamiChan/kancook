import _ from 'lodash'

const start2 = require('./data/start2.json')

const $ships = _.keyBy(start2.api_mst_ship, 'api_id')
const $slotitems = _.keyBy(start2.api_mst_slotitem, 'api_id')

export default class Recipe {
  constructor(opts) {
    this.recipeId = Number(opts.recipeId)
    this.itemId = Number(opts.itemId)
    this.stage = Number(opts.stage)
    this.day = Number(opts.day)
    this.secretary = Number(opts.secretary)
    this.fuel = Number(opts.fuel)
    this.ammo = Number(opts.ammo)
    this.steel = Number(opts.steel)
    this.bauxite = Number(opts.bauxite)
    this.reqItemId = Number(opts.reqItemId)
    this.reqItemCount = Number(opts.reqItemCount)
    this.buildkit = Number(opts.buildkit)
    this.remodelkit = Number(opts.remodelkit)
    this.certainBuildkit = Number(opts.certainBuildkit)
    this.certainRemodelkit = Number(opts.certainRemodelkit)
    this.upgradeToItemId = Number(opts.upgradeToItemId)
    this.upgradeToItemLevel = Number(opts.upgradeToItemLevel)
    this.key = String(opts.key)
    this.kanmusu = ($ships[this.secretary] || {}).api_name || 'none'
    this.itemName = $slotitems[this.itemId].api_name
    this.reqItemName = ($slotitems[this.reqItemId] || {}).api_name || 'none'
  }

  get identity() {
    return ({
      recipeId: this.recipeId,
      itemId: this.itemId,
      stage: this.stage,
      day: this.day,
      secretary: this.secretary,
      fuel: this.fuel,
      ammo: this.ammo,
      steel: this.steel,
      bauxite: this.bauxite,
      reqItemId: this.reqItemId,
      reqItemCount: this.reqItemCount,
      buildkit: this.buildkit,
      remodelkit: this.remodelkit,
      certainBuildkit: this.certainBuildkit,
      certainRemodelkit: this.certainRemodelkit,
      upgradeToItemId: this.upgradeToItemId,
      upgradeToItemLevel: this.upgradeToItemLevel,
    })
  }

  get cost() {
    return ({
      fuel: this.fuel,
      ammo: this.ammo,
      steel: this.steel,
      bauxite: this.bauxite,
      reqItemId: this.reqItemId,
      reqItemCount: this.reqItemCount,
      buildkit: this.buildkit,
      remodelkit: this.remodelkit,
      certainBuildkit: this.certainBuildkit,
      certainRemodelkit: this.certainRemodelkit,
    })
  }
}
