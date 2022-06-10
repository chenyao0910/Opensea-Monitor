const got = require('got');
var tunnel = require('tunnel');
const Discord = require("discord.js");
const intents = new Discord.Intents(32767);
const client = new Discord.Client({
    intents
});
const {
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    Formatters
} = require('discord.js');
const {
    Webhook,
    MessageBuilder
} = require('discord-webhook-node');
const {
    toString,
    find
} = require('lodash');
client.once("ready", () => {
    console.log(`${client.user.username} is online`);
    client.user.setActivity("Monitoring", {
        type: "PLAYING"
    });
});
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
/*
var url = 'https://api.opensea.io/collection/timepiece-community'
var floor = '';
var owner = '';
var total_supply = '';
var img = '';
var name = '';
var address = '';

async function listMonitor(task, url) {
    try {
        var date = new Date();
        var formatted = date.toISOString();
        var check = 0;
        var res = await got.get(`https://api.opensea.io/api/v1/events?collection_slug=${task}&event_type=created&only_opensea=false&offset=0&limit=20&occurred_after=${formatted}`, {
            responseType: 'json'
        })
        // console.log(`https://api.opensea.io/api/v1/events?collection_slug=${task}&event_type=created&only_opensea=false&offset=0&limit=20&occurred_after=${formatted}`)
        while (res.body.asset_events.length == 0) {
            res = await got.get(`https://api.opensea.io/api/v1/events?collection_slug=${task}&event_type=created&only_opensea=false&offset=0&limit=20&occurred_after=${formatted}`, {
                responseType: 'json'
            })
        }
        console.log(`Monitoring ${task} Listing`);
        const hook = new Webhook(url);
        for (var i = res.body.asset_events.length - 1; i >= 0; i--) {
            if (res.body.asset_events[i].event_type == "created") {
                console.log(res.body.asset_events[i].asset.name)
                const embed = new MessageBuilder()
                    .setTitle(res.body.asset_events[i].asset.name)
                    .setURL(res.body.asset_events[i].asset.permalink)
                    .setColor('#00bd09')
                    .addField("Price", toString(res.body.asset_events[i].starting_price / 1000000000000000000) + ' E')
                    .addField("Type", "Listed")
                    .setTimestamp()
                    .setThumbnail(res.body.asset_events[i].asset.image_url)
                hook.send(embed).then(() => console.log('Sent webhook successfully!'))
                    .catch(err => console.log(err.message));
            }
        }
    } catch (e) {
        console.log(e);
    }
    check = 1;
    if (check == 1) {
        await sleep(2000)
        listMonitor(task, url)
    }
}

async function saleMonitor(task, url) {
    try {
        var date = new Date();
        var formatted = date.toISOString();
        var check = 0;
        var res2 = await got.get(`https://api.opensea.io/api/v1/events?collection_slug=${task}&event_type=successful&only_opensea=false&offset=0&limit=20&occurred_after=${formatted}`, {
            responseType: 'json'
        })
        while (res2.body.asset_events.length == 0) {
            res2 = await got.get(`https://api.opensea.io/api/v1/events?collection_slug=${task}&event_type=successful&only_opensea=false&offset=0&limit=20&occurred_after=${formatted}`, {
                responseType: 'json'
            })
        }
        console.log(`Monitoring ${task} Sales`);

        const hook = new Webhook(url);
        for (var i = res2.body.asset_events.length - 1; i >= 0; i--) {
            if (res2.body.asset_events[i].event_type == "successful") {
                console.log(res2.body.asset_events[i].asset.name)
                const embed2 = new MessageBuilder()
                    .setTitle(res2.body.asset_events[i].asset.name)
                    .setURL(res2.body.asset_events[i].asset.permalink)
                    .setColor('#ff0000')
                    .addField("Price", toString(res2.body.asset_events[i].total_price / 1000000000000000000) + ' E')
                    .addField("Type", "Sold")
                    .setThumbnail(res2.body.asset_events[i].asset.image_url)
                    .setTimestamp()
                hook.send(embed2)
                    .then(() => console.log('Sent webhook successfully!'))
                    .catch(err => console.log(err.message));
            }
        }
    } catch (e) {
        console.log(e);
    }
    check = 1;
    if (check == 1) {
        await sleep(2000)
        saleMonitor(task, url);
    }
}

async function main() {
    const task1Promise = saleMonitor('mutantcats', '');
    const task2Promise = listMonitor('mutantcats', '');
    const task3Promise = saleMonitor('thehumanoids', '');
    const task4Promise = listMonitor('thehumanoids', '');
    const task5Promise = saleMonitor('fanggangnft', '');
    const task6Promise = listMonitor('fanggangnft', '');
    const task7Promise = saleMonitor('creature-world-collection', '');
    const task8Promise = listMonitor('creature-world-collection', '');
    const task9Promise = saleMonitor('goop-troop', '');
    const task10Promise = listMonitor('goop-troop', '');
    const task11Promise = saleMonitor('winterbears', '');
    await Promise.all([task1Promise, task2Promise, task3Promise, task4Promise, task5Promise, task6Promise, task7Promise, task8Promise, task9Promise, task10Promise, task11Promise]);
}

main();