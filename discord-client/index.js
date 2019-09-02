const Discord = require('discord.js');
const axios = require('axios');
const settings = require('./botsettings.json')
const supportedGames = require('./supportedgames.json');

const client = new Discord.Client();
const token = settings.token;
const apiUrl = settings.apiUrl;
const keyword = settings.keyword;

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

function getEmbedMessage(title, colorCode, description, fields,  url){
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