## Still WIP, <small>to use you must download and install webdis, get it at [webd.is](webd.is)</small>

###making progress

to use, just add dependency to redis.app

```javascript
var myApp = angular.module('mycool.app',['redis.app']);
```

to use different host or port for webdis, use redisUrlProvider in config

```javascript
myApp.config(['redisUrlProvider',function(redisUrlProvider){
    redisUrlProvider.setHost('myhost.com');
    redisUrlProvider.setPort(4444);
}]);
```
Now run redis commands
```javascript
myApp.controller('RedisCtrl',['redisService',function(redisService){
    var self = this;
    redisService.hmset('hash:key',['key1','val1','key2','val2']).then(function(res){
        
    });
    redisService.hgetall('hash:key').then(function(res){
        self.data = res.data.HGETALL;
    });
}]);
```
