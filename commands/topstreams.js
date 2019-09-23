const settings = require('../discord-client/botsettings.json')
const app = require('express')();
const cors = require('cors');
const axios = require('axios');
const supportedGames = require('../discord-client/supportedgames.json');
const getEmbedMessage = require('../shared/embed').getEmbedMessage;

//external API base urls
const twitchApiUrl = 'https://api.twitch.tv/helix/';

//http headers
const twitchHeader = {
    headers: { 'Client-ID': `${settings.twitch_clientid}`}
};

module.exports = {
    execute: async function(msg){
        let args = msg.content.split(' ').filter(function(element){
            if(element != '' || element != null)
                return element;
        });

        //if game is not specified
        if(!args[1])
        {
            try
            {
                let twitchStreamerArr = await getTwitchTopStreams();
                let streamFields = getTwitchStreamFieldsForEmbed(twitchStreamerArr);
                msg.channel.send(getEmbedMessage('Top streams', 3447003, 'Currently most viewed channels on twitch.tv', streamFields));
            }
            catch(err)
            {
                msg.channel.send('Oops, an error occurred. Please try again later!');
            }
        }
        //if game is specified
        else
        {
            let game_name = supportedGames[args[1]];
            if(game_name)
            {
                let twitchStreamerArr = await getTwitchTopStreams(game_name);
                let streamFields = getTwitchStreamFieldsForEmbed(twitchStreamerArr);
                msg.channel.send(getEmbedMessage('Top streams', 3447003, 'Currently most viewed channels on twitch.tv', streamFields));
            }
            //if game not supported yet/not found
            else
            {
                msg.channel.send(getEmbedMessage('❌ Game not supported yet', 15158332, '!wm supportedgames to see list of supported games'));
            }
        }
    }
}


async function getTwitchStreamsData(game_name, numStreams){
    let game_id;

    if(!numStreams)
        numStreams = 10;

    let url = twitchApiUrl+'streams?first='+numStreams;

    //if there is a game name specified, get game id first
    if(game_name)
    {
        game_id = await getGameIdByGameName(game_name);
        url += '&game_id=' + game_id;
    }

    return await axios.get(url, twitchHeader)
    .then(async function(response){
        let body = response.data;
        let streams = [];
        for(let i = 0; i < numStreams; i++)
        {
            let stream = body.data[i];
            let game_id = stream.game_id;
            
            let game_name = await getGameNameById(game_id);

            if(game_name == null)
            {
                console.log('NULL');
                break;
            }

            streams.push({
                id: stream.id,
                user_id: stream.user_id,
                user_name: stream.user_name,
                game_id: stream.game_id, //create a dictionary (game_id ==> game name)
                game_name: game_name,
                viewer_count: stream.viewer_count,
                title: stream.title
            });
        }

        return streams;
    })
    .catch((err) => {
        return null;
    });
}

async function getTwitchTopStreams(game_name){
    return await getTwitchStreamsData(game_name)
        .then((res) => {
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

//returns Promise
function getGameNameById(game_id){
    return axios.get(twitchApiUrl+`games?id=${game_id}`, twitchHeader)
    .then((res) => {
        return res.data.data[0].name;
    })
    .catch((err) => {
        return null;
    })
}

//returns Promise
function getGameIdByGameName(game_name){
    return axios.get(twitchApiUrl+`games?name=${game_name}`, twitchHeader)
    .then((res) => {
        return res.data.data[0].id;
    })
    .catch((err) => {
        return null;
    })
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

class TwitchStreamer{
    constructor(name, game_name, viewers)
    {
        this.name = name;
        this.game_name = game_name;
        this.viewers = viewers;
    }
}