const { Observable, } = require('rxjs');
const {filter, share, distinct, mapTo, throttleTime} = require('rxjs/operators');
var mqtt = require('./mqttCluster.js');

global.mtqqLocalPath = process.env.MQTTLOCAL;
global.mtqqLocalPath = 'mqtt://192.168.0.11';

// IKEA BILRESA two-button remote (E2489), since 28/10/2026, in place of the TRADFRI shortcut
// button 0x84ba20fffecacbc4 (press for on, hold for off). Press I: socket on. Press O: socket
// off. Holding a button (brightness_move_up/down, then brightness_stop) does nothing.
const remoteStream = new Observable(async subscriber => {
    var mqttCluster=await mqtt.getClusterAsync()
    mqttCluster.subscribeData('zigbee2mqtt/0x1035970000b17d39', function(content){
            subscriber.next(content)
    });
  });

  const sharedStream = remoteStream.pipe(share())

  const onStream = sharedStream.pipe(
    filter( m => m.action==='on'),
    mapTo("on")
  )
  const offStream = sharedStream.pipe(
    filter( m => m.action==='off'),
    mapTo("off")
  )

  onStream.subscribe(async m => {
    //console.log(JSON.stringify(m))
    (await mqtt.getClusterAsync()).publishMessage('zigbee2mqtt/0xa4c138b23751a6d9/set',JSON.stringify({state:'ON'}));    
  })
  offStream.subscribe(async m => {
    //console.log(JSON.stringify(m))
    (await mqtt.getClusterAsync()).publishMessage('zigbee2mqtt/0xa4c138b23751a6d9/set',JSON.stringify({state:'OFF'}));    
  })