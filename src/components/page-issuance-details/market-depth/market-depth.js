/**
 * @module {can.Component} components/market-depth market-depth
 * @parent components.common
 *
 * Issuance Details / Market Depth
 *
 * @signature `<market-depth />`
 *
 * @link ../src/components/page-issuance-details/market-depth/market-depth.html Full Page Demo
 * ## Example
 *
 * @demo src/components/page-issuance-details/market-depth/market-depth.html
 *
 */

import Component from 'can-component';
import DefineMap from 'can-define/map/';
import DefineList from 'can-define/list/list';
import _ from 'lodash';
import './market-depth.less';
import view from './market-depth.stache';

let data1 = { key: "ask", type: "area-spline", data: new DefineList(
  _.times(30, i => Math.abs(Math.floor(Math.sin(i) * 750))).concat(_.times(31, () => null))
  ) },
  data2 = { key: "bid", type: "area-spline", data: new DefineList(
    _.times(29, () => null).concat(_.times(32, i => Math.abs(Math.floor(Math.sin(2*i) * 750))))
  ) };

export const ViewModel = DefineMap.extend({
  dataColumns: {
    get (lastVal, resolve) {
      setTimeout(() => {
        resolve(new DefineList([data1, data2]))
      }, 100)
    }
  },
  config: {
    value: {
      color: {
        pattern: ['#32B576', '#EC2F39']
      },
      height: 30,
      axis: {
        x1: {
          type: 'category',
          categories: _.times(61, i => '30,' + (650 + i*10)),
          tick: {
            count: 4
          },
          padding1: {
            left: 0
          }
        },
        y: {
          tick: {
            count: 4,
            format: (d) =>  Math.floor(d)
          }
        }
      },
      grid: {
        x: {
          show: true
        },
        y: {
          show: true
        }
      },
      size: {
        height: 140
      },
      padding: {
        left: 30,
        right: 10,
        bottom: 10
      }
    }
  }
});

export default Component.extend({
  tag: 'market-depth',
  ViewModel,
  view
});
