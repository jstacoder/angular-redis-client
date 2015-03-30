'use strict';

var forEach = angular.forEach,
    equals = angular.equals,
    extend = angular.extend,
    fromJson = angular.fromJson,
    isArray = angular.isArray,
    isDefined = angular.isDefined;

var app = angular.module('redis.app',[]);
// use redisProvider to configure 
app.constant('REDIS_HOST','127.0.0.1'); // standard webdis host
app.constant('REDIS_PORT',7379); // standard webdis port

app.provider('redisUrl',['REDIS_HOST','REDIS_PORT',function(REDIS_HOST,REDIS_PORT){
  /* 
   * use redisUrlProvider.set('host',xxxx); 
   * and redisUrlProvider.set('port',xxxx); 
   * inside a config function
   * to customize your setup
   */
    var self = this;

    self.host = self.host ? self.host : REDIS_HOST;
    self.port = self.port ? self.port : REDIS_PORT;
    self.set = function(key,val){
        self[key] = val;
    };
    self.setHost = function(host){
        self.set('host',host);
    };
    self.setPort = function(port){
        self.set('port',port);
    };
    return {
        $get:[function(){
            return "http://"+self.host+":"+self.port;
        }],
        set:self.set,
        setHost:self.setHost,
        setPort:self.setPort
    };
}]);

app.factory('redisArgs',[function(){
    return function(args){
        var rtn = '';
        if(isString(args)){
            return '/'+args;
        }
        if(!isArray(args)){
            forEach(args,function(val,key){
                rtn += '/'+key+'/'+val;
            });
        }else{
            forEach(args,function(val){
                rtn += '/'+val;
            });
        }
        return rtn;
    };
}]);
app.factory('redisRequest',['$http','redisUrl','redisArgs',function($http,redisUrl,redisArgs){
    var url = redisUrl;
    return function(reqType,args){
        return $http.get(url+redisArgs([reqType])+redisArgs(args));
    };
}]);
app.factory('redisGet',['redisRequest','$q',function(redisRequest,$q){
    var reqType = 'get';
    var promise = $q.defer();
    return function(args){
        redisRequest(reqType,args).then(function(res){
            try {
                var rtn = fromJson(res.data.get);
            }catch(err){
                var rtn = res.data.get;
            }
            promise.resolve(rtn);
        });
        return promise.promise;
    };
}]);
redisApp.factory('redisCallService',['$http','redisUrlService',function redisCallService($http,redisUrlService){
    return function(cmd,args){
        return $http.get(
                redisUrlService(cmd,args)
        );
    };
}]);
redisApp.service('redisService',['redisCallService','$q',function redis(redisCallService,$q){
    var self = this;

    self.get = function(key){
        return redisCallService('GET',[key]);
    };
    self.set = function(key,val,ex){
        return redisCallService('SET',[key,val,exp]);
    };
    self.hmset = function(hashName,args){
        var nArgs = [hashName];
        forEach(args,function(itm){
            nArgs.push(itm);
        });
        return redisCallService('HMSET',nArgs);
    };
    self.hset = function(hashName,args){
        var nArgs = [hashName];
        forEach(args,function(itm){
            nArgs.push(itm);
        });
        return redisCallService('HSET',nArgs);
    };
    self.hget = function(hashName,key){
        return redisCallService('HGET',[hashName.key]);
    };
    self.hgetall = function(hashName){
        return redisCallService('HGETALL',[hashName])
    };
}]);
