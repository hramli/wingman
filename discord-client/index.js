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
    
    if(arguments[1] == 'topstreams')
    {
        axios.get(apiUrl)
        .then((response) => {
            let res = response.data;
            let numStreams = res.length;
            let string = '\n';
            for(let i = 0; i < numStreams; i++)
            {
                string += `${res[i].user_name} ${res[i].viewer_count}`;
                if(i != numStreams - 1)
                    string += '\n';
            }
            msg.reply(string);
        })
        .catch((err) => {
            console.log(err);
            msg.reply('Oops, an error occurred. Please try again later!');
        });
    }
});

client.login(token);