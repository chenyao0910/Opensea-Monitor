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

client.on("messageCreate", async message => {
    if (message.content.startsWith("!sku")) {
        //let Proxies = fs.readFileSync('proxies.txt', 'utf8').toString().split(':');
        //let len = Proxies.length;
        let host = 'us2-crystal.kirbyproxy.com'
        let port = '8688'
        let userPass = 'ak7i3rby-8ffb4c:11sf3d7f6d9d414ecc2'
        try {
            const nft = await got.get(url, {
                responseType: 'json',
                headers: {
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Safari/537.36"
                }
            }).then(data => {
                floor = data.body.collection.stats.floor_price;
                owner = data.body.collection.stats.num_owners;
                total_supply = data.body.collection.stats.total_supply;
                img = data.body.collection.featured_image_url;
                name = data.body.collection.name;
                address = data.body.collection.payout_address.toString();
            })
            const exampleEmbed2 = new MessageEmbed()
                .setTitle(name)
                //.setURL("https://stockx.com/" + res.body.Products[0].shortDescription)
                .setColor('#7557c8')
                .addField("Floor Price", floor.toString() + " E",true)
                .addField("Owner", owner.toString(), true)
                .addField("Total Volume", total_supply.toString(), true)
                .addField("Address", "```"+address+"```")
                //.addField("Size", '```' + sizeinfo.map(x => x.size).join("\n") + '```', true)
                //.addField("Lowest Ask", '```' + sizeinfo.map(u => u.price + "|(" + ((parseInt(u.price) - retailPrice) / retailPrice * 100).toFixed(0) + "%)").join("\n") + '```', true)
                .setThumbnail(img)
                .setTimestamp()
            //.setFooter('Exclusively For Cookology', 'https://cdn.discordapp.com/attachments/664554808392286218/706592243904938034/New_Cookology.png');
            message.channel.send({
                embeds: [exampleEmbed2]
            })
        } catch (err) {
            console.log(err);
        }
    }
    
})
client.login('Input Bot Token');
*/


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
                    .setFooter("YYDS", 'https://cdn.discordapp.com/attachments/895462498076078111/895970566195015731/unknown.png')
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
                    .setFooter("YYDS", 'https://cdn.discordapp.com/attachments/895462498076078111/895970566195015731/unknown.png')
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
    const task1Promise = saleMonitor('mutantcats', 'https://discord.com/api/webhooks/895849688274718760/_OJvhV38yq2D4DEf7NOy4m-gerKscC1RpFap-W9HH-epbYxFNATJ9AWjseBCMO1yuc3Q');
    const task2Promise = listMonitor('mutantcats', 'https://discord.com/api/webhooks/895849688274718760/_OJvhV38yq2D4DEf7NOy4m-gerKscC1RpFap-W9HH-epbYxFNATJ9AWjseBCMO1yuc3Q');
    const task3Promise = saleMonitor('thehumanoids', 'https://discord.com/api/webhooks/895908044934905887/pebg8ChBzBjpH965yQiatGxBm1RbrwDvGq3YO59UY-R8Ra2FPrAdHIjUOVBDzuV8fIKw');
    const task4Promise = listMonitor('thehumanoids', 'https://discord.com/api/webhooks/895908044934905887/pebg8ChBzBjpH965yQiatGxBm1RbrwDvGq3YO59UY-R8Ra2FPrAdHIjUOVBDzuV8fIKw');
    const task5Promise = saleMonitor('fanggangnft', 'https://discord.com/api/webhooks/895908098185777172/LsLYR9Cnjjubjet0A1o0IFVhHliVRbwxLt-7bHeJw-8N9iPvmUBX1A5K5PR0WdSbIxOe');
    const task6Promise = listMonitor('fanggangnft', 'https://discord.com/api/webhooks/895908098185777172/LsLYR9Cnjjubjet0A1o0IFVhHliVRbwxLt-7bHeJw-8N9iPvmUBX1A5K5PR0WdSbIxOe');
    const task7Promise = saleMonitor('creature-world-collection', 'https://discord.com/api/webhooks/895908149150756875/iZOK4uOOFKK2tzP7JaWbq_k7MsiuaXLVruDJT6kfx9emTKBwspt41yqF3Fc9a7nRgF6u');
    const task8Promise = listMonitor('creature-world-collection', 'https://discord.com/api/webhooks/895908149150756875/iZOK4uOOFKK2tzP7JaWbq_k7MsiuaXLVruDJT6kfx9emTKBwspt41yqF3Fc9a7nRgF6u');
    const task9Promise = saleMonitor('goop-troop', 'https://discord.com/api/webhooks/895908207724232755/2z3jDCZw4eRHEp6OO8LWO0Xn3YAQCV8KbbLPOWoNVmIuT2KodZ88wN7_RSW5xdIH_kNO');
    const task10Promise = listMonitor('goop-troop', 'https://discord.com/api/webhooks/895908207724232755/2z3jDCZw4eRHEp6OO8LWO0Xn3YAQCV8KbbLPOWoNVmIuT2KodZ88wN7_RSW5xdIH_kNO');
    const task11Promise = saleMonitor('winterbears', 'https://discord.com/api/webhooks/895908265886617600/X3aPYYgcE69ihqA9cpS5SrjEcpzdLIv2Ri7gJRGkM6PoNrbbUgmtFe4M90P-gQwgfJpH');
    const task12Promise = listMonitor('winterbears', 'https://discord.com/api/webhooks/895908265886617600/X3aPYYgcE69ihqA9cpS5SrjEcpzdLIv2Ri7gJRGkM6PoNrbbUgmtFe4M90P-gQwgfJpH');
    const task13Promise = saleMonitor('habbo-avatars', 'https://discord.com/api/webhooks/895908328658567218/TrHNOoT-oM_fqBR4dDR-lo35s5gaRmSGGR5WFYKVb6K4G8a7nYG2E_FOKRnbE0sP5VGj');
    const task14Promise = listMonitor('habbo-avatars', 'https://discord.com/api/webhooks/895908328658567218/TrHNOoT-oM_fqBR4dDR-lo35s5gaRmSGGR5WFYKVb6K4G8a7nYG2E_FOKRnbE0sP5VGj');
    const task15Promise = saleMonitor('theyakuzacatssociety', 'https://discord.com/api/webhooks/895908379787149352/DgiCwba0KKJoxbPkcb-MxiRYUmFPC-b9e2Pg5ASkGUGX0vnbQa-YHKJUwGCFVXtsOJUY');
    const task16Promise = listMonitor('theyakuzacatssociety', 'https://discord.com/api/webhooks/895908379787149352/DgiCwba0KKJoxbPkcb-MxiRYUmFPC-b9e2Pg5ASkGUGX0vnbQa-YHKJUwGCFVXtsOJUY');
    const task17Promise = saleMonitor('cryptodickbutts-s3', 'https://discord.com/api/webhooks/895908445297991742/X_n-xy5MM6clmk2um9gOBiagT964-e0Sw9C2yTCjWCG97o5kW6kd0SwXWQT2vtlco-bP');
    const task18Promise = listMonitor('cryptodickbutts-s3', 'https://discord.com/api/webhooks/895908445297991742/X_n-xy5MM6clmk2um9gOBiagT964-e0Sw9C2yTCjWCG97o5kW6kd0SwXWQT2vtlco-bP');
    const task19Promise = saleMonitor('niftydegen', 'https://discord.com/api/webhooks/895908593923153930/EOKztjfk3sK9vUCBFWgdnp3-cfaWF7kd6eYhBgrGZNI-OGAI4hKvWnbh0yNtK3r7HaG4');
    const task20Promise = listMonitor('niftydegen', 'https://discord.com/api/webhooks/895908593923153930/EOKztjfk3sK9vUCBFWgdnp3-cfaWF7kd6eYhBgrGZNI-OGAI4hKvWnbh0yNtK3r7HaG4');
    const task21Promise = saleMonitor('official-surreals', 'https://discord.com/api/webhooks/895908006129201192/aOoqt1ly3HzSWsFW_4u1EvKnBZIkI16lzzP7tNkNRWnaQFQVTSBgcG5FtDywYIwsWk5m');
    const task22Promise = listMonitor('official-surreals', 'https://discord.com/api/webhooks/895908006129201192/aOoqt1ly3HzSWsFW_4u1EvKnBZIkI16lzzP7tNkNRWnaQFQVTSBgcG5FtDywYIwsWk5m');
    //const task23Promise = saleMonitor('mekaverse', 'https://discord.com/api/webhooks/895908006129201192/aOoqt1ly3HzSWsFW_4u1EvKnBZIkI16lzzP7tNkNRWnaQFQVTSBgcG5FtDywYIwsWk5m');
   // const task24Promise = listMonitor('mekaverse', 'https://discord.com/api/webhooks/895908006129201192/aOoqt1ly3HzSWsFW_4u1EvKnBZIkI16lzzP7tNkNRWnaQFQVTSBgcG5FtDywYIwsWk5m');
    await Promise.all([task1Promise, task2Promise, task3Promise, task4Promise, task5Promise, task6Promise, task7Promise, task8Promise, task9Promise, task10Promise, task11Promise, task12Promise, task13Promise, task14Promise, task15Promise, task16Promise, task17Promise, task18Promise, task19Promise, task20Promise, task21Promise, task22Promise]);
}

main();