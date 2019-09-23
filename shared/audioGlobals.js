var dispatcher = null;
var audioQueue = [];

module.exports = {
    setDispatcher: function(val){
        dispatcher = val;
    },
    getDispatcher: function(){
        return dispatcher
    },
    addDispatcherEventListener: function(event, callback){
        dispatcher.on(event, () => {
            callback();
        })
    },
    callDispatcherMethod: function(methodName){
        dispatcher[methodName]();
    },
    pushAudioQueue: function(val){
        audioQueue.push(val);
    },
    setAudioQueue: function(arr){
        audioQueue = arr;
    },
    getAudioQueue: function(){
        return audioQueue
    },
    shiftAudioQueue: function(){
        return audioQueue.shift();
    }
}