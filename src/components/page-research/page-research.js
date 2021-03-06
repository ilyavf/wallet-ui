/**
 * @module {can.Component} wallet-ui/components/page-research page-research
 * @parent components.pages
 *
 * A short description of the page-research component
 *
 * @signature `<page-research />`
 *
 * @link ../src/components/page-research/page-research.html Full Page Demo
 *
 * ## Example
 *
 * @demo src/components/page-research/page-research.html
 */

import Component from 'can-component'
import DefineMap from 'can-define/map/map'
import './page-research.less'
import view from './page-research.stache'

export const ViewModel = DefineMap.extend({
  message: {
    value: 'This is the page-research component'
  }
})

export default Component.extend({
  tag: 'page-research',
  ViewModel,
  view
})
