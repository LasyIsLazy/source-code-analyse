/**
 * 导出全局 API
 */

/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  // Vue.config 获取 Vue 的配置
  // TOLEARN: Vue.config
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  // Vue 的 util，非公共 API
  // TOLEARN: Vue.util
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }
// TOLEARN: Vue.set, delete, nextTick
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  // Vue.observalbe 使对象可响应
  // TOLEARN Vue.observable
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }

  // TOLEARN ? Object.create
  // TOLEARN Vue.options
  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  // TOLEARN _base
  Vue.options._base = Vue

  // 把 builtInComponents 混合到 Vue.options.components 中
  extend(Vue.options.components, builtInComponents)

  initUse(Vue) // 初始化 Vue 的 use 方法
  initMixin(Vue) // 初始化 mixin
  initExtend(Vue)
  initAssetRegisters(Vue)
}
