const axios = require('axios');
require('dotenv').config()

//Webhook private
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL
const DISCORD_WEBHOOK_ERROR_URL = process.env.DISCORD_WEBHOOK_ERROR_URL


const discordNotification = (collectionName, collectionURL, imgURL, itemNumber) => {

    const colorList = ['4633', '24435', '693142', '9753277', '15325350', '15637248', '13264642', '12271107', '11411474', '10166822']

    //15 = emojiList.length
    const color = colorList[Math.floor(Math.random() * 10)]


    axios.post(
        DISCORD_WEBHOOK_URL,
        JSON.stringify(
            {
                // the username to be displayed
                username: 'Leviathan Tools',
                // the avatar to be displayed
                avatar_url:
                    'https://i.ibb.co/5WsCVxZ/Leviatan.png',

                // embeds to be sent
                embeds: [
                    {
                        timestamp: new Date(),
                        // decimal number colour of the side of the embed
                        color: color,
                        // author: {
                        //     name: 'Nombre autor'
                        // },
                        // embed title
                        // - link on 2nd row
                        title: `"${collectionName}" rarity obtained!`,
                        url: collectionURL,

                        thumbnail: {
                            url:
                                imgURL || "Failed to get imgURL",
                        },

                        fields: [
                            {
                                name: 'Number of items',
                                value: itemNumber || "Failed to get number of items",
                                inline: true
                            },
                            //     {
                            //         name: 'Price',
                            //         value: price || "Failed to get price",
                            //         inline: true
                            //     },
                        ],

                        // footer
                        // - icon next to text at bottom
                        footer: {
                            text: 'Leviathan Tools',
                            icon_url:
                                'https://i.ibb.co/5WsCVxZ/Leviatan.png',
                        },
                    },
                ],
            }
        ),
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }

    )

}

const discordError = (space, error) => {

    const time = new Date().getHours() + ':' + (new Date().getMinutes() < 10 ? '0' : '') + new Date().getMinutes() + ':' + (new Date().getSeconds() < 10 ? '0' : '') + new Date().getSeconds()

    const dayMonth = `${new Date().getDate()}/${new Date().toLocaleString('default', { month: 'short' })}`

    axios.post(
        DISCORD_WEBHOOK_ERROR_URL,
        JSON.stringify(
            {
                // the username to be displayed
                username: 'Leviathan Tools Error Handling',
                // the avatar to be displayed
                avatar_url:
                    'https://i.ibb.co/5WsCVxZ/Leviatan.png',

                // embeds to be sent
                embeds: [
                    {
                        // timestamp: new Date(),
                        // timestamp: new Date(),
                        // decimal number colour of the side of the embed
                        color: 16711680,

                        title: `Error: ${space}`,

                        fields: [
                            {
                                name: error.name ?? "Error name",
                                value: error.message ?? "Failed to get error message",
                                inline: false
                            },
                            {
                                name: 'Time',
                                value:
                                    `${dayMonth} - ${time}`,
                                inline: true
                            },
                        ],

                        // footer
                        // - icon next to text at bottom
                        footer: {
                            text: 'Leviathan Tools',
                            icon_url:
                                'https://i.ibb.co/5WsCVxZ/Leviatan.png',
                        },
                    },
                ],
            }
        ),
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }

    )

}

const discordOpenseaError = (fieldCollection) => {

    const time = new Date().getHours() + ':' + (new Date().getMinutes() < 10 ? '0' : '') + new Date().getMinutes() + ':' + (new Date().getSeconds() < 10 ? '0' : '') + new Date().getSeconds()

    const dayMonth = `${new Date().getDate()}/${new Date().toLocaleString('default', { month: 'short' })}`

    axios.post(
        DISCORD_WEBHOOK_ERROR_URL,
        JSON.stringify(
            {
                // the username to be displayed
                username: 'Leviathan Tools Error Handling',
                // the avatar to be displayed
                avatar_url:
                    'https://i.ibb.co/5WsCVxZ/Leviatan.png',

                // embeds to be sent
                embeds: [
                    {
                        timestamp: new Date(),

                        // decimal number colour of the side of the embed
                        color: 2130402,

                        title: `Opensea DOM change`,
                        thumbnail: {
                            url: 'https://i.ibb.co/LNVvGT9/x5-TRL-5-400x400.png'
                        },

                        fields:
                            fieldCollection,

                        // footer
                        // - icon next to text at bottom
                        footer: {
                            text: 'Leviathan Tools',
                            icon_url:
                                'https://i.ibb.co/5WsCVxZ/Leviatan.png',
                        },
                    },
                ],
            }
        ),
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }

    )

}

const discordScriptRunning = () => {
    axios.post(
        DISCORD_WEBHOOK_URL,
        JSON.stringify(
            {
                // the username to be displayed
                username: 'Leviathan Tools',
                // the avatar to be displayed
                avatar_url:
                    'https://i.ibb.co/5WsCVxZ/Leviatan.png',

                // embeds to be sent
                embeds: [
                    {
                        timestamp: new Date(),
                        // decimal number colour of the side of the embed
                        color: 65413,
                        // author: {
                        //     name: 'Nombre autor'
                        // },
                        // embed title
                        // - link on 2nd row
                        title: "Script running",
                        description: "dom-checker.js 🟢",
                        // url:
                        // 'https://blablabla',

                        // thumbnail: {
                        //     url:
                        //         imgURL || "Failed to get imgURL",
                        // },

                        fields: [
                            //     {
                            //         name: 'Site',
                            //         value: site,
                            //         inline: true
                            //     },
                            //     {
                            //         name: 'NFT name',
                            //         value: nftname || "Failed to get name",
                            //         inline: true
                            //     },
                            //     {
                            //         name: 'Price',
                            //         value: price || "Failed to get price",
                            //         inline: true
                            //     },
                        ],

                        // footer
                        // - icon next to text at bottom
                        footer: {
                            text: 'Leviathan Tools ',
                            icon_url:
                                'https://i.ibb.co/5WsCVxZ/Leviatan.png',
                        },
                    },
                ],
            }
        ),
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    )
};


//Exports
exports.discordNotification = discordNotification
exports.discordError = discordError
exports.discordOpenseaError = discordOpenseaError
exports.discordScriptRunning = discordScriptRunning
