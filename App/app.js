const { Observable, } = require('rxjs');
const {filter, share, distinct, mapTo, throttleTime} = require('rxjs/operators');
var mqtt = require('./mqttCluster.js');

global.mtqqLocalPath = process.env.MQTTLOCAL;
global.mtqqLocalPath = 'mqtt://192.168.0.11';

const remoteStream = new Observable(async subscriber => {  
    var mqttCluster=await mqtt.getClusterAsync()   
    mqttCluster.subscribeData('zigbee2mqtt/0x84ba20fffecacbc4', function(content){   
            subscriber.next(content)
    });
  });

  const sharedStream = remoteStream.pipe(share())

  const onStream = sharedStream.pipe(
    filter( m => m.action==='on'),
    mapTo("on")
  )
  const offStream = sharedStream.pipe(
    filter( m => m.action==='brightness_move_up' || m.action==='brightness_stop'),
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