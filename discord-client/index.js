const Discord = require('discord.js');
const axios = require('axios');
const ytdl = require('ytdl-core');
const settings = require('./botsettings.json')
const supportedGames = require('./supportedgames.json');

const client = new Discord.Client();
const token = settings.token;
const apiUrl = settings.apiUrl;
const keyword = settings.keyword;

const streamOptions = {seek: 0, volume: 1};
let dispatcher = null;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });
  
client.on('message', async(msg) => {
    let arguments = msg.content.split(' ');

    //prevent bot from replying to itself
    if (msg.author.bot) return;
    
    //if message is not a bot command
    if(arguments[0] != keyword)
        return;

    //if command is missing arguments
    if(arguments.length <= 1)
    {
        const x_emote = client.emojis.find(emoji => emoji.name == 'x');
        msg.channel.send(getEmbedMessage(`❌ Missing arguments`, 15158332, `!wm [option]`));
    }
    
    if(arguments[1] == 'topstreams')
    {
        //if game is not specified
        if(!arguments[2])
        {
            try
            {
                let twitchStreamerArr = await getTwitchTopStreams();
                let streamFields = getTwitchStreamFieldsForEmbed(twitchStreamerArr);
                msg.channel.send(getEmbedMessage('Top streams', 3447003, 'Currently most viewed channels on twitch.tv', streamFields));
            }
            catch(err)
            {
                console.log(err);
                msg.channel.send('Oops, an error occurred. Please try again later!');
            }
        }
        //if game is specified
        else
        {
            let game_name = supportedGames[arguments[2]];
            if(game_name)
            {
                let twitchStreamerArr = await getTwitchTopStreams(game_name);
                let streamFields = getTwitchStreamFieldsForEmbed(twitchStreamerArr);
                msg.channel.send(getEmbedMessage('Top streams', 3447003, 'Currently most viewed channels on twitch.tv', streamFields));
            }
            //if game not supported yet/not found
            else
            {
                let fields = [];
                msg.channel.send(getEmbedMessage('❌ Game not supported yet', 15158332, '!wm supportedgames to see list of supported games'));
            }
        }
    }
    else if(arguments[1] == "play")
    {
        play(msg, arguments[2]);
    }
    else if(arguments[1] == "stop")
    {
        if(dispatcher)
        {
            dispatcher.end();
        }
    }
    else if(arguments[1] == "pause")
    {
        if(dispatcher)
        {
            dispatcher.pause();
        }
    }
    else if(arguments[1] == "help")
    {
        //show list of available commands

    }
    //if bad command
    else
    {
        //show list of commands with !wm help
        msg.channel.send(getEmbedMessage('❌ Command not found', 15158332));
    }
});

client.login(token);

function play(msg, url){
    //if user is not in a voice channel
    const voiceChannel = msg.member.voiceChannel;
    if(!voiceChannel)
    {
        msg.channel.send(getEmbedMessage('❌ You need to be in a voice channel to play music', 15158332));
        return;
    }

    //if bot does not have permissions to join voice channel
    let permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK'))
    {
        message.channel.send('I need the permissions to join and   speak in your voice channel!');
        return;
    }

    //if message is missing youtube url
    if(!url)
    {
        msg.channel.send(getEmbedMessage(`❌ Missing arguments`, 15158332, `!wm play [youtube link]`));
        return;
    }

    try
    {
        if(dispatcher != null)
        {
            //TODO: add to queue
            //for now, complain music is already playing
            msg.channel.send(getEmbedMessage(`❌ Already playing audio`, 15158332, `Please try again later`));
            return;
        }
        voiceChannel.leave();

        voiceChannel.join().then(async (connection) => {
            console.log('joined channel');

            const audioInfo = await ytdl.getInfo(url);
            const audio = {
                title: audioInfo.title,
                url: audioInfo.video_url,
                channel: audioInfo.author.name,
                duration: audioInfo.length_seconds
            };

            const stream = ytdl(url, {filter: "audioonly"});
            dispatcher = connection.playStream(stream, streamOptions);

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

            dispatcher.on('end', end => {
                console.log('left channel');
                voiceChannel.leave();
                dispatcher = null;
            });
        })
        .catch(err => {
            console.log(err);
            dispatcher = null;
            voiceChannel.leave();
            msg.channel.send(getEmbedMessage(`❌ Error playing music`, 15158332, `Check url`))
        });
    }
    catch(err)
    {
        msg.channel.send(getEmbedMessage(`❌ Bad arguments`, 15158332, `Invalid url`));
    }
}

function getEmbedMessage(title, colorCode, description, fields,  url, inlineFields){
    let embedMessage = {
        color: colorCode,
        title: title,
        fields: fields
    };
    if(fields)
        embedMessage['fields'] = fields;

    if(description)
        embedMessage['description'] = description;
    
    if(url)
        embedMessage['url'] = url;
    
    if(inlineFields)
        embedMessage['fields'].push(inlineFields);
    
    return {
        embed: embedMessage
    };
}

//Returns promise containing Array<TwitchStreamer> 
function getTwitchTopStreams(game_name){
    let url = apiUrl + 'twitch';
    if(game_name)
    {
        url += '?game_name='+game_name;
    }

    return axios.get(url)
        .then((response) => {
            let res = response.data;
            let numStreams = res.length;
            let streamerData = []
            for(let i = 0; i < numStreams; i++)
            {
                streamerData.push(
                    new TwitchStreamer(res[i].user_name, res[i].game_name, res[i].viewer_count)
                );
            }
            return streamerData;
        })
        .catch((err) => {
            return err;
        });
}

//Return fields for discord embed message
function getTwitchStreamFieldsForEmbed(twitchStreamerArr){
    let streamFields = [];
    let arrLength = twitchStreamerArr.length;
    for(let i = 0; i < arrLength; i++)
    {
        streamFields.push(
            {
                name: twitchStreamerArr[i].name,
                value: `playing ${twitchStreamerArr[i].game_name} with ${twitchStreamerArr[i].viewers} viewers`
            }
        );
    }
    return streamFields;
}

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

//may need to refactor with helper function to prevent too much try-catch blocks in async/await
function promiseErrorHandler(promise)
{
}

//may have to move to a separate file
class TwitchStreamer{
    constructor(name, game_name, viewers)
    {
        this.name = name;
        this.game_name = game_name;
        this.viewers = viewers;
    }
}