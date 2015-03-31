'use strict';

var forEach = angular.forEach,
    equals = angular.equals,
    extend = angular.extend,
    fromJson = angular.fromJson,
    isArray = angular.isArray,
    isDefined = angular.isDefined,
    isString = angular.isString;
    
var isObject = function(itm){
    return angular.isObject(itm) && !isArray(itm);  
};

var app = angular.module('redis.app',[]);
// use redisProvider to configure 
app.constant('REDIS_HOST','127.0.0.1'); // standard webdis host
app.constant('REDIS_PORT',7379); // standard webdis port

app.provider('redisUrl',['REDIS_HOST','REDIS_PORT',function(REDIS_HOST,REDIS_PORT){
  /* 
   * use redisUrlProvider.setHost(xxxx); 
   * and redisUrlProvider.setPort(xxxx); 
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
            return "http://"+self.host+":"+self.port+"/";
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
        }else {
            if(!isArray(args) && isObject(args)){
                forEach(args,function(val,key){
                    rtn += '/'+key+'/'+val;
                });
            }else{
                forEach(args,function(val){
                    rtn += '/'+val;
                });
            }
        }
        return rtn;
    };
}]);
app.factory('redisUrlService',['redisUrl','redisArgs',function redisUrlService(REDIS_URL,redisArgs){
    return function(cmd,args){
            var url = REDIS_URL+cmd+'/';
            if(args && args.length && isArray(args)){
                forEach(args,function(itm,idx){
                    if (isString(itm)) {
                        url = url + itm + (idx != args.length-1 ? '/' : '');                    
                    }else{
                        '/';
                    }                        
                });
            }else{
                url += redisArgs(args);
            }
            return url;
    };
}]);
app.factory('redisCallFactory',['$http','redisUrlService',function redisCallService($http,redisUrlService){
    return function(cmd,args){
        return $http.get(
                redisUrlService(cmd,args)
        );
    };
}]);
app.factory('redisRequest',['$http','redisUrl','redisArgs',function($http,redisUrl,redisArgs){
    var url = redisUrl;
    return function(reqType,args){
        if (!url.endsWith('/')) {
            url += '/';
        }
        return $http.get(url+"/"+redisArgs(reqType)+redisArgs(args));
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
app.factory('redisCallService',['$http','redisRequest','$q',function redisCallService($http,redisRequest,$q){
    return function(cmd,args){
        var defer = $q.defered();
        redisRequest(cmd,args).then(function(res){
            defer.resolve(res.data[cmd]);
        });
        return defer.promise;
    };
}]);
app.service('redisService',['redisCallFactory','$q',function redis(redisCallService,$q){
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
        var tmpArgs = angular.extend({},args,{name:hashName});
        var keys = Object.keys(tmpArgs);
        var nArgs = keys.map(function(itm){
            return itm !== 'name' ? args[itm] : tmpArgs[itm];
        });
        console.log(nArgs);
        return redisCallService('HSET',nArgs);
    };
    self.hget = function(hashName,key){
        if(!key){
            return self.hgetall(hashName);
        }
        return redisCallService('HGET',[hashName,key]);
    };
    self.hgetall = function(hashName){
        return redisCallService('HGETALL',[hashName])
    };
    self.expire = function(key,seconds){
        return redisCallService('EXPIRE',[key,seconds]);  
    };
}]);
