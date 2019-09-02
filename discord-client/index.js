const Discord = require('discord.js');
const axios = require('axios');
const settings = require('./botsettings.json')

const client = new Discord.Client();
const token = settings.token;
const apiUrl = settings.apiUrl;
const keyword = settings.keyword;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });
  
client.on('message', msg => {
    let arguments = msg.content.split(' ');

    //prevent bot from replying to itself
    if (msg.author.bot) return;
    
    //if message is not a bot command
    if(arguments[0] != keyword)
        return;

    if(arguments.length <= 1)
    {
        const x_emote = client.emojis.find(emoji => emoji.name == 'x');
        msg.channel.send({embed: {
            color: 15158332,
            title: `❌ Missing arguments`,
            description: `!wm [option]`
          }
        });
    }
    
    if(arguments[1] == 'topstreams')
    {
        axios.get(apiUrl)
        .then((response) => {
            let res = response.data;
            let numStreams = res.length;
            let streamFields = [];
            for(let i = 0; i < numStreams; i++)
            {
                streamFields.push(
                    {
                        name: res[i].user_name,
                        value: `playing ${res[i].game_name} with ${res[i].viewer_count} viewers`
                    }
                );
            }
            msg.channel.send({embed: {
                color: 3447003,
                title: "Top streams",
                url: "https://www.twitch.tv",
                description: "Currently most viewed channels on twitch.tv",
                fields: streamFields,
                timestamp: new Date(),
                footer: {
                  icon_url: client.user.avatarURL,
                  text: "© wingman"
                }
              }
            });
        })
        .catch((err) => {
            console.log(err);
            msg.channel.send('Oops, an error occurred. Please try again later!');
        });
    }
});

client.login(token);