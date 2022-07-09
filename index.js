const { performance } = require('perf_hooks');
const fs = require('fs');
const chalk = require('chalk');
//Import como module de nuestras funciones
const scrapy = require('./src/scrapy.js')
const { discordNotification } = require('./src/discord.js')

const { sleep } = require('./src/various')
const { requestToJSON } = require('./src/json-creator.js')
const rarityJSON = require('./src/rarity-json.js')
const { counter } = require('./src/various')
const { msToMinAndSecs } = require('./src/various')
const { msToTime } = require('./src/various')
const { arrayFilter } = require('./src/various')
const { createDirs } = require("./src/various.js");

const cycleDelay = 4000;
const requestDelay = 500;

const input_url = [
    'https://opensea.io/collection/punk-doodled-apes',
    // 'https://opensea.io/collection/nftlions',
    // 'https://opensea.io/collection/mekaverse',
    // 'https://opensea.io/collection/creativeartquest',
    // 'https://opensea.io/collection/folktailsoflunarian',
]

const input_url1 = [
    'https://opensea.io/collection/lazy-lions',
    'https://opensea.io/collection/mutant-ape-yacht-club',
    'https://opensea.io/collection/supducks',
    'https://opensea.io/collection/robotos-official',
    'https://opensea.io/collection/cool-cats-nft',
    'https://opensea.io/collection/bossbeauties',
    'https://opensea.io/collection/sneaky-vampire-syndicate',
    'https://opensea.io/collection/sappy-seals',
    'https://opensea.io/collection/lootproject',
    'https://opensea.io/collection/the-crypto-chicks',
    'https://opensea.io/collection/marscatsvoyage',
    'https://opensea.io/collection/pudgypenguins',
    'https://opensea.io/collection/fanggangnft',
    'https://opensea.io/collection/dapperdinosnft',
    'https://opensea.io/collection/0n1-force',
    'https://opensea.io/collection/veefriends',
    'https://opensea.io/collection/crypto-hobos',
    'https://opensea.io/collection/thecryptodads',
    'https://opensea.io/collection/wicked-ape-bone-club',
    'https://opensea.io/collection/meebits',
    'https://opensea.io/collection/cyberkongz-vx',
    'https://opensea.io/collection/bears-deluxe',
    'https://opensea.io/collection/magic-mushroom-clubhouse',
    'https://opensea.io/collection/bored-ape-kennel-club',
    'https://opensea.io/collection/sadgirlsbar',
    'https://opensea.io/collection/ununicornsofficial',
    'https://opensea.io/collection/koala-intelligence-agency',
    'https://opensea.io/collection/0xvampire-project',
    'https://opensea.io/collection/omnimorphs',
    'https://opensea.io/collection/the-wanderers',
    'https://opensea.io/collection/theclaylings',
    'https://opensea.io/collection/the-doge-pound',
    'https://opensea.io/collection/onchainmonkey',
    'https://opensea.io/collection/dystopunks-v2',
    'https://opensea.io/collection/creativeartquest',
    'https://opensea.io/collection/creativeartquestgenesis',
    'https://opensea.io/collection/meowbits-collection',
    'https://opensea.io/collection/nftlions',
    'https://opensea.io/collection/mekaverse'
]

// console.log(input_url.length);
const count_items = [0]
var count_collections = 0


const resolve = async (collectionURL) => {
    const t0 = performance.now();

    const result = await scrapy(collectionURL)

    if (result.hasOwnProperty('error')) return 'error'

    console.log(chalk`Collection: {bold.hex('#EE9B00') ${result.collectionName}} {bold.hex('#CA6702') [${result.itemNumber} items]}`);

    //Guardamos el número de items en el array
    count_items.push(result.itemNumber)

    //Creamos el JSON
    await requestToJSON(collectionURL, result.itemNumber, requestDelay)

    await rarityJSON(collectionURL)
    // discordNotification(webhook, collectionName, collectionURL, imgURL, item_number)
    await discordNotification(result.collectionName, collectionURL, result.imgURL, result.itemNumber)

    const t1 = performance.now();

    console.log(chalk`{bold.hex('#EE9B00') ${result.collectionName}} {bold.hex('#CA6702') [${result.itemNumber} items]} rarity obtained in {bold.hex('#94D2BD') ${msToMinAndSecs(t1 - t0)} minutes}.`);
}

const executeScript = async (input_url) => {
    const total0 = performance.now();
    console.log(' ');

    //Comprobamos/creamos el file tree (results: extension, raw)
    createDirs()

    //Array colecciones existentes (almacenamos el slug)
    const existingCollections = fs.readdirSync('./results/raw').filter(file => file.endsWith('.json')).map(el => el.slice(0, -5))

    //Según introduzcamos un array o un string, el programa se ejecutará de una manera.
    if (typeof input_url === 'string') {

        const stringToArray = []
        stringToArray.push(input_url)

        //Comprobamos si existe la colección pedida
        const collectionsToGet = arrayFilter(existingCollections, stringToArray.map(el => el.slice(30)))

        if (collectionsToGet.length === 0) {
            console.log(chalk`{bold.hex('#DABF6C') ► Introduced collection already exists.\n}`);
            return
        }
        console.log(chalk`{bold.hex('#DABF6C') ► COLLECTION NUMBER 1}`);

        await resolve('https://opensea.io/collection/' + input_url)
    }

    //Si es un array
    else if (typeof input_url === 'object') {

        //Filtramos colecciones existentes
        //Eliminamos duplicados con Array.from(new Set(input_url))
        const collectionsToGet = arrayFilter(existingCollections, Array.from(new Set(input_url)).map(el => el.slice(30)))

        if (collectionsToGet.length === 0) {
            console.log(chalk`{bold.hex('#DABF6C') ► Introduced collections already exist.\n}`);
            return
        }
        //Numero de colecciones que se van a obtener
        console.log(chalk`{bold.hex('#94D2BD') COLLECTIONS TO ANALIZE: ${collectionsToGet.length}\n}`);

        //Recorremos collectionsToGet y ejecutamos
        for (url of collectionsToGet) {
            console.log(chalk`{bold.hex('#DABF6C') ► COLLECTION NUMBER ${collectionsToGet.indexOf(url) + 1}/${collectionsToGet.length}}`);

            const movida = await resolve('https://opensea.io/collection/' + url)

            //Sumamos uno al contador de colecciones
            count_collections++
            if (movida === 'error') {
                console.log(chalk`{bold.hex('#dc6060') Unable to get ${url} collection}`);
                count_collections-- //Lo restamos, al ser error
            }
            //Si es el último ciclo, no hace sleep
            if (collectionsToGet.indexOf(url) < collectionsToGet.length - 1) {
                console.log(`Waiting for ${cycleDelay} ms...\n`);
                await sleep(cycleDelay)
            }
        }

        const [totalItems, totalRequests] = counter(count_items)

        const total1 = performance.now();

        //Singular
        if (count_collections === 1) {
            if ((total1 - total0) > 3600000) {
                //toTime
                console.log(chalk`{bold.hex('#94D2BD') \n---------------  SUMMARY  ---------------}`);
                console.log(chalk`{bold.hex('#94D2BD')      Collection: ${count_collections}       ${msToTime(total1 - total0)} hours}`);
                console.log(chalk`{bold.hex('#94D2BD')      Items: ${totalItems}          Requests: ${totalRequests}}`);

            } else {
                //toMins
                console.log(chalk`{bold.hex('#94D2BD') \n---------------  SUMMARY  ---------------}`);
                console.log(chalk`{bold.hex('#94D2BD')      Collection: ${count_collections}       ${msToMinAndSecs(total1 - total0)} mins}`);
                console.log(chalk`{bold.hex('#94D2BD')      Items: ${totalItems}          Requests: ${totalRequests}}`);
            }
        }
        //Plural
        else {
            if ((total1 - total0) > 3600000) {
                //toTime
                console.log(chalk`{bold.hex('#94D2BD') \n---------------  SUMMARY  ---------------}`);
                console.log(chalk`{bold.hex('#94D2BD')      Collections: ${count_collections}      ${msToTime(total1 - total0)} hours}`);
                console.log(chalk`{bold.hex('#94D2BD')      Items: ${totalItems}           Requests: ${totalRequests}}`);
            } else {
                //toMins
                console.log(chalk`{bold.hex('#94D2BD') \n---------------  SUMMARY  ---------------}`);
                console.log(chalk`{bold.hex('#94D2BD')      Collections: ${count_collections}       ${msToMinAndSecs(total1 - total0)} mins}`);
                console.log(chalk`{bold.hex('#94D2BD')      Items: ${totalItems}          Requests: ${totalRequests}}`);
            }
            // For testing purpouses
            // console.log(chalk`{bold.hex('#94D2BD') \n---------------  SUMMARY  ---------------}`);
            // console.log(chalk`{bold.hex('#94D2BD')   Collections: 30   |   Time: 00:15 mins }`);
            // console.log(chalk`{bold.hex('#94D2BD')   Items: 310456     |   Requests: 740}`);
        }
        console.log(" ");

        // console.log(process._getActiveHandles());
        // process.exit();

        // console.log(" ");
        // console.log("getActiveRequest");
        // console.log(process._getActiveRequests());
    }


}

executeScript(input_url)

// executeScript(input_test)





