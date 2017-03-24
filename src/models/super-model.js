import connect from 'can-connect';
import dataParse from 'can-connect/data/parse/';
import construct from 'can-connect/constructor/';
import constructStore from 'can-connect/constructor/store/';
import constructOnce from 'can-connect/constructor/callbacks-once/';
import canMap from 'can-connect/can/map/';
import canRef from 'can-connect/can/ref/';
import dataCallbacks from 'can-connect/data/callbacks/';
import realtime from 'can-connect/real-time/';
import feathersBehavior from 'can-connect-feathers/service';

const superModel = function (options) {
  const behaviors = [
    feathersBehavior,
    dataParse,
    construct,
    constructStore,
    constructOnce,
    canMap,
    canRef,
    dataCallbacks,
    realtime
  ];

  return connect(behaviors, options);
};

export default superModel;
