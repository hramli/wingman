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

app.get('/', (req,res) => {
    axios.get(twitchApiUrl+'streams?first=20', twitchHeader)
    .then((response) => {
        let body = response.data;
        let streams = [];
        let numStreams = 20; //change to query param
        for(let i = 0; i < numStreams; i++)
        {
            let stream = body.data[i];
            let game_id = stream.game_id;

            streams.push({
                id: stream.id,
                user_id: stream.user_id,
                user_name: stream.user_name,
                game_id: stream.game_id, //create a dictionary (game_id ==> game name)
                viewer_count: stream.viewer_count,
                title: stream.title
            });
        }
        res.send(streams);
    })
    .catch((err) => {

    });
})