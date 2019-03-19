/* @flow */

import {
  tip,
  toArray,
  hyphenate,
  formatComponentName,
  invokeWithErrorHandling
} from '../util/index'
import { updateListeners } from '../vdom/helpers/index'

export function initEvents (vm: Component) {
  /**
   * 初始化 _events 对象，用于存放该组件上绑定的事件
   * 在调用
   * Vue.prototype.$on
   * Vue.prototype.$once
   * Vue.prototype.$off
   * Vue.prototype.$emit
   * 时，会操作这个对象
   */
  vm._events = Object.create(null)

  /**
   *  该属性表示父组件是否通过 `@hook:` 把钩子函数绑定在当前组件上，
   * 如 `@hook:created="callback"`。
   * 作用是优化钩子，具体参考 callHook 函数的实现。
   */
  vm._hasHookEvent = false

  // init parent attached events
  const listeners = vm.$options._parentListeners
  // TOLEARN: updateComponentListeners
  if (listeners) {
    updateComponentListeners(vm, listeners)
  }
}

let target: any

function add (event, fn) {
  target.$on(event, fn)
}

function remove (event, fn) {
  target.$off(event, fn)
}

function createOnceHandler (event, fn) {
  const _target = target
  return function onceHandler () {
    const res = fn.apply(null, arguments)
    if (res !== null) {
      _target.$off(event, onceHandler)
    }
  }
}

export function updateComponentListeners (
  vm: Component,
  listeners: Object,
  oldListeners: ?Object
) {
  target = vm
  updateListeners(listeners, oldListeners || {}, add, remove, createOnceHandler, vm)
  target = undefined
}

export function eventsMixin (Vue: Class<Component>) {
  const hookRE = /^hook:/
  // 实例方法 $on：监听实例上的自定义事件
  Vue.prototype.$on = function (event: string | Array<string>, fn: Function): Component {
    const vm: Component = this
    if (Array.isArray(event)) {
      // 如果是数组则取每个值再次调用 $on 方法
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$on(event[i], fn)
      }
    } else {
      /**
       * 将回调函数放入 `vm._events[event]` 中
       * vm.events 存放当前实例监听的事件及回调
       * event 是要监听的事件，string 类型
       * fn 是回调函数
       */
      (vm._events[event] || (vm._events[event] = [])).push(fn)
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      // TOLEARN optimize hook:event
      if (hookRE.test(event)) {
        vm._hasHookEvent = true
      }
    }
    return vm
  }

  // 实例方法 $once：监听一个自定义事件，但是只触发一次
  Vue.prototype.$once = function (event: string, fn: Function): Component {
    const vm: Component = this
    /**
     * on 函数将 fn 进行包装，并作为监听器的回调
     * on 函数调用一次就会调用 $off 方法移除该监听器
     */
    function on () {
      vm.$off(event, on)
      fn.apply(vm, arguments)
    }
    on.fn = fn // TOLEARN: 这行作用是什么？
    vm.$on(event, on)
    return vm
  }

  // 实例方法 $off：移除自定义事件监听器
  Vue.prototype.$off = function (event?: string | Array<string>, fn?: Function): Component {
    const vm: Component = this
    // all
    // 如果参数为空，移除全部监听器（即将 _events 置为一个新的空对象）
    if (!arguments.length) {
      vm._events = Object.create(null)
      return vm
    }
    // array of events
    // 如果 event 是数组，则分别取值再调用 $off
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$off(event[i], fn)
      }
      return vm
    }
    // specific event
    // 移除特定的事件
    const cbs = vm._events[event]
    if (!cbs) {
      return vm
    }
    if (!fn) {
      // 没有指定要移除的监听器，则移除该事件所有的监听器
      vm._events[event] = null
      return vm
    }
    // specific handler
    // 移除特定的监听器
    let cb
    let i = cbs.length
    while (i--) {
      cb = cbs[i]
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1)
        break
      }
    }
    return vm
  }

  // 实例方法 $emit：触发当前实例上的事件
  Vue.prototype.$emit = function (event: string): Component {
    const vm: Component = this
    if (process.env.NODE_ENV !== 'production') {
      const lowerCaseEvent = event.toLowerCase()
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip(
          `Event "${lowerCaseEvent}" is emitted in component ` +
          `${formatComponentName(vm)} but the handler is registered for "${event}". ` +
          `Note that HTML attributes are case-insensitive and you cannot use ` +
          `v-on to listen to camelCase events when using in-DOM templates. ` +
          `You should probably use "${hyphenate(event)}" instead of "${event}".`
        )
      }
    }
    let cbs = vm._events[event] // 该事件对应的监听器
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs
      const args = toArray(arguments, 1)
      const info = `event handler for "${event}"`
      for (let i = 0, l = cbs.length; i < l; i++) {
        // 触发监听器
        invokeWithErrorHandling(cbs[i], vm, args, vm, info)
      }
    }
    return vm
  }
}
