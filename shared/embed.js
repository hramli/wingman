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

function getAudioQueueFieldsForEmbed(){
    let arrLength = audioQueue.length;
    let audioQueueFields = [];
    for(let i = 0; i < arrLength; i++)
    {
        let queueItem = audioQueue[i];
        audioQueueFields.push(
            {
                name:  'Video title',
                value: queueItem.title,
                inline: true
            },
            {
                name: 'Channel',
                value: queueItem.channel,
                inline: true
            }
        );
    }
    return audioQueueFields;
}

module.exports = {
    getEmbedMessage: getEmbedMessage,
    getAudioQueueFieldsForEmbed: getAudioQueueFieldsForEmbed
}