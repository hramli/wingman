const settings = require('./serversettings.json');
const app = require('express')();
const cors = require('cors');
const axios = require('axios');

//external API base urls
const twitchApiUrl = 'https://api.twitch.tv/helix/';

//http headers
const twitchHeader = {
    headers: { 'Client-ID': `${settings.twitch_clientid}`}
};

//configure CORS
app.use(cors());

app.listen(3001);

app.get('/api/twitch', async (req,res) => {
    let game_name = req.query.game_name;
    let numStreams = req.query.first;
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


    axios.get(url, twitchHeader)
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
        res.send(streams);
    })
    .catch((err) => {
        console.log(err);
        res.sendStatus(err.status);
    });
});

app.get('/test', async function(req,res){
    let string = await getGameIdByGameName('Fortnite');
    res.send(string);
})

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