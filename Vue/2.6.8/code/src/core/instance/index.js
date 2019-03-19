import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// Vue 的构造函数
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue) // 初始化：created 及之前做的事情
stateMixin(Vue) // Vue 原型上的一些属性、函数：$data、$props、$set、$delete、$watch
eventsMixin(Vue) // 事件相关的实例方法：$on、$once、$off、$emit
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
