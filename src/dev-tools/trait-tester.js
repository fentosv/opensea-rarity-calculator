const axios = require('axios')

// const collectionURL = 'https://opensea.io/collection/sneaky-vampire-syndicate'
// const collectionURL = 'https://opensea.io/collection/plodding-pirates'
// const collectionURL = 'https://opensea.io/collection/theninjahideout'
const collectionURL = 'https://opensea.io/collection/mekaverse'


const offset = 1
const limit = 50

const collectionSlug = collectionURL.slice(30)
const api_string = 'https://api.opensea.io/api/v1/assets?order_by=pk&order_direction=desc&limit=' + limit + '&' + 'offset=' + offset + '&collection=' + collectionSlug


//Constructor del objeto
class Item {
    constructor(name, token_id, traits) {
        this.name = name
        this.token_id = token_id
        this.traits = traits
    }
}
//Traits es objeto
const traits = {}


const request = async () => {
    try {
        console.log("Try...");
        const data = await axios.get(api_string)
        return data.data

    } catch (error) {
        console.log(`Request failed: ${error.message}\nRetrying...\n`)
        await sleep(2000)
        request()
    }
}

const resolve = async () => {
    const { assets } = await request()

    // console.log({ assets });

    console.log(`Número de items en este bucle: ${assets.length}`);

    //Recorremos el número de assets que tengamos
    for (const e in assets) {

        //Nombre y token_id de cada asset
        const name = assets[e].name
        const token_id = assets[e].token_id

        for (trait in assets[e].traits) {

            // console.log(`"${assets[e].traits[trait].trait_type}" : "${assets[e].traits[trait].value}"`)

            //traits es un objeto
            //Nombre del trait : valor del trait
            traits[assets[e].traits[trait].trait_type] = assets[e].traits[trait].value
        }

        console.log(traits);

        const item = new Item(name, token_id, traits)

        // console.log(item);
    }

    //Luego para escribirlo hay que hacerlo en formato json, por lo que se usa stringify
    // const data = JSON.stringify(datos);


}

resolve()





