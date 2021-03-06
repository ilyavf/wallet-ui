/**
 * @module {can.Component} components/bit-alerts bit-alerts
 * @parent components.generic 0
 *
 * Floating Alerts
 *
 * @signature `<bit-alerts />`
 *
 *  To show an alert render `<bit-alerts />` component in the beginning of your body tag, and fire an event:
 *
 *  ```
 *  import hub from '~/utils/event-hub';
 *
 *  const options = {
 *    type: 'alert',
 *    kind: 'danger|success|info|warning',
 *    title: 'My Alert',
 *    displayInterval: 3000,
 *    message: 'This is an alert!'
 *  };
 *  hub.dispatch(options);
 *  ```
 *
 * @link ../src/components/common/alerts/alerts.html Full Page Demo
 * ## Example
 *
 * @demo src/components/common/alerts/alerts.html
 *
**/

import Kefir from 'kefir'
import canStream from 'can-stream-kefir'
import Component from 'can-component'
import DefineMap from 'can-define/map/map'
import canDefineStreamKefir from 'can-define-stream-kefir'
import view from './alerts.stache'
import hub from '~/utils/event-hub'
import CID from 'can-cid'

const hubStream = canStream.toStream(hub, 'alert').map(ev => {
  return Object.assign({
    id: CID(ev),
    kind: 'warning'
  }, ev)
})

export const ViewModel = DefineMap.extend({
  autoHideStream: {
    value () {
      return hubStream.flatMap(alert => {
        // Allows displayInterval to be falsy OR Infinity to disable autohide
        if (alert.displayInterval > 0 && alert.displayInterval !== Infinity) {
          return Kefir.later(alert.displayInterval, {
            type: 'remove',
            id: alert.id
          })
        }
        return Kefir.constant({ type: 'no-op' })
      })
    }
  },
  alerts: {
    stream () {
      return hubStream
        .merge(this.autoHideStream)
        .merge(this.stream('remove'))
        .scan((alerts, ev) => {
          switch (ev.type) {
            case 'alert':
              return [ev, ...alerts.slice()]

            case 'remove':
              return alerts.filter(item => item.id !== ev.id)

            default:
              return alerts
          }
        }, [])
    }
  },
  removeAlert (alert) {
    this.dispatch({ type: 'remove', id: alert.id })
  }
})
canDefineStreamKefir(ViewModel)

export default Component.extend({
  tag: 'bit-alerts',
  ViewModel,
  view
})
