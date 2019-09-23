const getEmbedMessage = require('../shared/embed').getEmbedMessage;

let audioGlobals = require('../shared/audioGlobals');

module.exports = {
    execute: function(msg){
        if(audioGlobals.getDispatcher())
        {
            audioGlobals.callDispatcherMethod('resume');
        }
    }
}