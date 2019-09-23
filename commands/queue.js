const embed = require('../shared/embed');

let audioGlobals = require('../shared/audioGlobals');

module.exports = {
    execute: function(msg){
        if(audioGlobals.getAudioQueue().length > 0)
        {
            msg.channel.send(embed.getEmbedMessage('Queue', 0xedfff7, 'Currently in queue', embed.getAudioQueueFieldsForEmbed()));
        }
        else
        {
            msg.channel.send(embed.getEmbedMessage('Queue', 0xedfff7, 'Queue is empty'));
        }
    }
}