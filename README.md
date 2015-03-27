## Still WIP, <small>to use you must download and install webdis, get it at [webd.is](webd.is)</small>

###making progress

to use, just add dependency to redis.app

```javascript
var myApp = angular.module('mycool.app',['redis.app']);
```

to use different host or port for webdis, use redisUrlProvider in config

```javascript
myApp.config(['redisUrlProvider',function(redisUrlProvider){
    redisUrlProvider.set('host','myhost.com');
    redisUrlProvider.set('port',4444);
}]);
```
