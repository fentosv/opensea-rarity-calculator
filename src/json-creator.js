const fs = require('fs');
const axios = require('axios')
const chalk = require('chalk');
const cliProgress = require('cli-progress');

const { msToMinAndSecs } = require('./various')
const { sleep } = require('./various')


//Función request a API Opensea
const request = async (api_url) => {
    try {
        // console.log("Try...");
        const data = await axios.get(api_url)
        return data.data

    } catch (error) {
        console.log(`Request failed: ${error.message}\nRetrying...\n`)
        await sleep(3000)
        request(api_url)
    }
}

//Tratamos el JSON de la respuesta de la API Opensea y obtenemos un JSON con los artículos que nos interesan

const collectionData = {}
const processData = (requestResponse, jsonUrl) => {
    //console.log(`Número de items en este bucle: ${requestResponse.length}`);

    //Recorremos el número de requestResponse que tengamos
    for (const e in requestResponse) {

        //Nombre y token_id de cada asset
        const name = requestResponse[e].name
        const permalink = requestResponse[e].permalink.trim()
        const token_id = requestResponse[e].token_id.trim()
        const address = requestResponse[e].asset_contract.address
        const image_url = requestResponse[e].image_url

        //Rellenamos el objeto 'traits'
        const traits = {}

        for (trait in requestResponse[e].traits) {
            // console.log(`"${requestResponse[e].traits[trait].trait_type}" : "${requestResponse[e].traits[trait].value}"`)

            //Nombre del trait : valor del trait
            traits[requestResponse[e].traits[trait].trait_type] = requestResponse[e].traits[trait].value
        }

        traits["Trait Count"] = Object.keys(traits).length
        // console.log(traits);

        // Inicializamos token_id con valor de token_id. Formato: {1312:{...}}
        collectionData[token_id] = { name, permalink, address, image_url, traits }
    }

    //Luego para escribirlo hay que hacerlo en formato json, por lo que se usa stringify
    const dateado = JSON.stringify(collectionData);
    fs.writeFileSync(jsonUrl, dateado);

}

const requestToJSON = async (collectionURL, itemNumber, requestDelay) => {
    const collectionSlug = collectionURL.slice(30)

    const requestNumber = Math.ceil(itemNumber / 50);

    console.log(`Delay between requests: ${requestDelay} ms.`);
    console.log(`Estimated time to complete: ${msToMinAndSecs(requestNumber * (requestDelay + 1520 /*Aproximación del delay*/))} minutes.\n`);



    //Ruta archivo
    const jsonUrl = "./results/raw/" + collectionSlug + '.json'

    //Si no existe el item.json, lo creamos
    if (!fs.existsSync(jsonUrl)) {
        fs.writeFileSync(jsonUrl, JSON.stringify({}))
    }

    //Formato barra de progreso
    const progressBar = new cliProgress.SingleBar({
        // format: 'Fetching data |' + _colors.cyan('{bar}') + '| {percentage}% || {value}/{total} requests',
        format: 'Fetching data |' + chalk.hex('#005F73')('{bar}') + '| {percentage}% || {value}/{total} requests',

        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });

    // Inicializamos barra de progreso
    progressBar.start(requestNumber, 0);

    //Bucle de X requestNumber 
    for (i = 1; i <= requestNumber;) {
        //La API de Opensea tiene limitado el offset a 10.000, por lo que al pasar de la request 200 peta
        if (i <= 200) {
            progressBar.update(i);
            // progressBar.increment();
            await sleep(requestDelay)
            // console.log(`Request: ${i}/${requestNumber}`);
            const offset = (50 * (i - 1));
            const api_string = 'https://api.opensea.io/api/v1/assets?order_by=pk&order_direction=desc&limit=50&' + 'offset=' + offset + '&collection=' + collectionSlug

            //Sacamos info de request con destructuring
            const { assets } = await request(api_string)

            //Si request ok, se procesan datos y continúa el bucle
            if (assets) {
                // console.log("Request succeeded!");
                //Procesamiento de datos
                processData(assets, jsonUrl)
                i++
            }
        }
        //Cuando i>200, tenemos que cambiar el orden del almacén de NFTs de la API para obtener los que no obtuvimos en las 200 primeras requests       
        else {
            await sleep(requestDelay)
            progressBar.update(i);
            // console.log(`Entramos en request >200: ${i}/${requestNumber}`);
            const offset = (50 * (i - 201));
            const api_string = 'https://api.opensea.io/api/v1/assets?order_by=pk&order_direction=asc&limit=50&' + 'offset=' + offset + '&collection=' + collectionSlug

            //Sacamos info de request con destructuring
            const { assets } = await request(api_string)

            //Si request ok, se procesan datos y continúa el bucle
            if (assets) {
                // console.log("Request succeeded!");
                //Procesamiento de datos
                processData(assets, jsonUrl)
                i++
            }
        }
    }
    progressBar.stop();

    //Limpiamos el objeto collectionData
    for (const prop of Object.getOwnPropertyNames(collectionData)) {
        delete collectionData[prop];
    }
}

// requestToJSON(collectionURL, itemNumber, requestDelay)


//Export como module
// module.exports = requestToJSON

exports.requestToJSON = requestToJSON //podemos cambiar el nombre

// exports.count_items = count_items