const { of, Observable, } = require('rxjs');
const { mapTo,delay,concatMap, startWith} = require('rxjs/operators');

const CronJob = require('cron').CronJob;
var mqtt = require('./mqttCluster.js');

global.mtqqLocalPath = process.env.MQTTLOCAL;
const nightTimeTariffStream = () =>  new Observable(subscriber => {  
    
    new CronJob(
        '0 24 * * *',
       function() {
           subscriber.next();
       },
       null,
       true,
       'Europe/London'
   );
});

nightTimeTariffStream().pipe(
 concatMap(v => of(v).pipe(
     delay(9 * 60 * 60  * 1000),
     mapTo("off"),
     startWith("on")
     ))
).subscribe(async m => {
    console.log('bathroom/master/state', m);
    (await mqtt.getClusterAsync()).publishMessage('bathroom/master/switch/state',m)
})