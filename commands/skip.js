const getEmbedMessage = require('../shared/embed').getEmbedMessage;

let audioGlobals = require('../shared/audioGlobals');

module.exports = {
    execute: function(msg){
        if(audioGlobals.getDispatcher())
        {
            audioGlobals.callDispatcherMethod('end');
        }
        else
        {
            msg.channel.send(getEmbedMessage(`❌ No audio playing`, 15158332, `!wm play [youtube link]`));
        }
    }
}