const Discord = require('discord.js');
const axios = require('axios');
const ytdl = require('ytdl-core');
const settings = require('./botsettings.json')
const supportedGames = require('./supportedgames.json');
const commandModulesPath = '../commands/';

const getEmbedMessage = require('../shared/embed').getEmbedMessage;

const bot = new Discord.Client();
const token = settings.token;
const apiUrl = settings.apiUrl;
const prefix = settings.prefix;
bot.commands = new Discord.Collection();

const commands = settings.commands;

commands.forEach((command) => {
    bot.commands.set(command, require(commandModulesPath+`${command}.js`));
})

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
});

bot.on('disconnect', () => {
    console.log(`Bot disconnected`);
});
  
bot.on('message', async(msg) => {
    let arguments = msg.content.split(' ');

    //prevent bot from replying to itself
    if (msg.author.bot) return;
    
    //if message is not a bot command
    if(!msg.content.startsWith(prefix))
        return;

    //if command is missing arguments
    if(arguments.length <= 0)
    {
        msg.channel.send(getEmbedMessage(`❌ Missing arguments`, 15158332, `!wm [option]`));
    }

    let command = arguments[0].replace(prefix, '');

    //if command does not exist
    if(!commands.includes(command))
    {
        msg.channel.send(getEmbedMessage(`❌ Command not found`, 15158332, `!help to see commands`));
    }

    //execute command
    bot.commands.get(command).execute(msg);
});

bot.login(token);