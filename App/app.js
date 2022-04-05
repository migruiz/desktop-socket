const { Observable, } = require('rxjs');
const {filter} = require('rxjs/operators');
var mqtt = require('./mqttCluster.js');

global.mtqqLocalPath = process.env.MQTTLOCAL;
global.mtqqLocalPath = 'mqtt://192.168.0.11';

const remoteStream = new Observable(async subscriber => {  
    var mqttCluster=await mqtt.getClusterAsync()   
    mqttCluster.subscribeData('zigbee2mqtt/0x84ba20fffed40589', function(content){   
            subscriber.next(content)
    });
  });

  const onStream = remoteStream.pipe(
    filter( m => m.action==='on')
  )
  const offStream = remoteStream.pipe(
    filter( m => m.action==='brightness_move_up')
  )

  onStream.subscribe(async m => {
    (await mqtt.getClusterAsync()).publishMessage('zigbee2mqtt/0x0c4314fffe20d4f8/set',JSON.stringify({state:'ON'}));    
  })
  offStream.subscribe(async m => {
    (await mqtt.getClusterAsync()).publishMessage('zigbee2mqtt/0x0c4314fffe20d4f8/set',JSON.stringify({state:'OFF'}));    
  })