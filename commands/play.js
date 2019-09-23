const ytdl = require('ytdl-core');
const getEmbedMessage = require('../shared/embed').getEmbedMessage;
const streamOptions = {seek: 0, volume: 1};

let audioGlobals = require('../shared/audioGlobals');

//returns mm:ss format
function secondsToMinutes(seconds){
    seconds = parseInt(seconds+'');

    let minutes = Math.floor(seconds / 60);
    seconds -= (60*minutes);

    if(seconds < 10)
    {
        return minutes+':0'+seconds;
    }

    return minutes+':'+seconds;
}

module.exports = {
    execute: async function(msg){

        let args = msg.content.split(' ').filter(function(element){
            if(element != '' || element != null)
                return element;
        });

        const voiceChannel = msg.member.voiceChannel;

        //if user is not in a voice channel
        if(!voiceChannel)
        {
            msg.channel.send(getEmbedMessage('❌ You need to be in a voice channel to play music', 15158332));
            return;
        }

        //if bot does not have permissions to join voice channel
        let permissions = voiceChannel.permissionsFor(msg.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK'))
        {
            message.channel.send('I need the permissions to join and speak in your voice channel!');
            return;
        }

        if(args.length < 2)
        {
            msg.channel.send(getEmbedMessage(`❌ Missing arguments`, 15158332, `!play [url]`));
        }

        let url = args[1];

        if(audioGlobals.getDispatcher())
        {
            const audioInfo = await ytdl.getInfo(url);

            let queuedItem = new AudioItem(voiceChannel, msg, url, audioInfo.title, audioInfo.author.name, audioInfo.length_seconds);
            audioGlobals.pushAudioQueue(queuedItem);

            msg.channel.send(getEmbedMessage(`Added to queue: ${queuedItem.title}`, 0xedfff7));
            return;
        }

        play(voiceChannel, msg, url);
    }
}

class AudioItem{
    constructor(voiceChannel, msg, url, title, name, length_seconds)
    {
        this.voiceChannel = voiceChannel;
        this.msg = msg;
        this.url = url;
        this.title = title;
        this.channel = name;
        this.duration = length_seconds;
    }
}

//plays audio of the youtube url
async function play(voiceChannel, msg, url){
    try
        {
            voiceChannel.join().then(async (connection) => {
                const audioInfo = await ytdl.getInfo(url);
                const audio = {
                    title: audioInfo.title,
                    url: audioInfo.video_url,
                    channel: audioInfo.author.name,
                    duration: audioInfo.length_seconds
                };
    
                const stream = ytdl(url, {filter: "audioonly"});
                audioGlobals.setDispatcher(connection.playStream(stream, streamOptions));
    
                msg.channel.send(getEmbedMessage(`Playing: ${audio.title}`, 0xedfff7, null,[
                    {
                        "name": 'Channel',
                        "value": `${audio.channel}`,
                        "inline": true
                    },
                    {
                        "name": 'Duration',
                        "value": secondsToMinutes(audio.duration),
                        "inline": true
                    }
                ]));
    
                audioGlobals.addDispatcherEventListener('end', () => {
                    if(audioGlobals.getAudioQueue().length == 0)
                    {
                        console.log('left channel');
                        voiceChannel.leave();
                        audioGlobals.setDispatcher(null);
                    }
                    else
                    {
                        console.log('loading next queue');
                        let queuedItem = audioGlobals.shiftAudioQueue();
                        play(queuedItem.voiceChannel, queuedItem.msg, queuedItem.url);
                    }
                });
            })
            .catch(err => {
                //this is if the argument is not a proper url, maybe query for youtube
                audioGlobals.setDispatcher(null);
                voiceChannel.leave();
                msg.channel.send(getEmbedMessage(`❌ Error playing music`, 15158332));
            });
        }
        catch(err)
        {
            msg.channel.send(getEmbedMessage(`❌ Bad arguments`, 15158332, `Invalid url`));
        }
}