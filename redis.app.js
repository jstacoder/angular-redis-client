'use strict';

var forEach = angular.forEach;

var redisApp = angular.module('redis.app',[]);// REQUIRES THE USE OF WEDBIS HTTP SERVER

redisApp.factory('REDIS_URL',[function REDIS_URL(){
    return function(){
        return "http://174.140.227.137:7379/";
    };
}]);
redisApp.factory('redisUrlService',['REDIS_URL',function redisUrlService(REDIS_URL){
    return function(cmd,args){
            var url = REDIS_URL()+cmd+'/';
            if(args && args.length){
                forEach(args,function(itm,idx){
                        url = url + itm + (idx != args.length-1 ? '/' : '');                    
                });
            }
            return url;
    };
}]);
redisApp.factory('redisCallService',['$http','redisUrlService',function redisCallService($http,redisUrlService){
    return function(cmd,args){
        return $http.get(
                redisUrlService(cmd,args)
        );
    };
}]);
redisApp.service('redis',['redisCallService','$q',function redis(redisCallService,$q){
    var self = this;

    self.get = function(key){
        return redisCallService('GET',[key]);
    };
    self.set = function(key,val,ex){
        return redisCallService('SET',[key,val,exp]);
    };
}]);
