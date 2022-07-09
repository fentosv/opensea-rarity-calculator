const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const { discordOpenseaError, discordScriptRunning } = require('../discord.js')

const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')


puppeteer.use(StealthPlugin())



const scrapy = async (url) => {
    // puppeteer usage as normal
    const result = await puppeteer.launch({ headless: true }).then(async browser => {

        console.log('Getting collection data...');
        const page = await browser.newPage()
        const response = await page.goto(url)
        // await page.screenshot({ path: 'testresult.png', fullPage: true })

        // Bloqueamos basura por rendimiento
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
                request.abort();
            } else {
                request.continue();
            }
        });

        //Comprobamos si es una colección existente en Opensea
        // console.log('Response status: ', response.status())

        if (response.status() >= 400 && response.status() <= 600) {

            const fakeError = {
                name: 'OpenSea DOM checker',
                message: `Error ${response.status()} in \n${url}`,
            }

            await browser.close()

            await discordError('Scraping', fakeError)

            return { error: 'error' }
        }

        await page.waitForTimeout(1000)


        //Link imágenes
        const imgURLs = await page.evaluate(() => {
            const elements = document.getElementsByClassName('Image--image');

            const imgLinks = []
            for (const element of elements) {
                imgLinks.push(element.src)
            }
            //Array de dos img: [0]Header [1]Img colección 
            return imgLinks.filter(element => element != null)
        })
        // console.log(imgURLs);


        //Número de items de la colección
        const itemNumber = await page.evaluate(() => {
            const elements = document.getElementsByClassName('AssetSearchView--results-count');

            const items = []
            for (const element of elements) {
                items.push(element.textContent)
            }
            return items.filter(element => element != null)
        })
        // console.log(itemNumber);


        //Nombre
        const name = await page.evaluate(() => {
            const elements = document.getElementsByClassName('Blockreact__Block-sc-1xf18x6-0 Textreact__Text-sc-1w94ul3-0 kyYyUT dgOUEe');

            return elements[0].textContent
        })
        // console.log(name);

        await browser.close()

        // console.log(`All done!`)

        const obj = {
            itemNumber: itemNumber[0].replace(/[^\d-]/g, '').trim(), //Quita letras
            imgURL: imgURLs[1],
            collectionName: name,
        }

        return obj
    })
    return result

}

const executeScript = async () => {

    //Mantenimiento/Dev: para sacar el obj que guardaremos en .env
    // console.log(JSON.stringify(await scrapy(process.env.DOM_CHECKER_URL)));

    const fieldCollection = []

    class Field {
        constructor(name, value, inline) {
            this.name = name
            this.value = value
            this.inline = inline
        }
    }

    //Obj sacado de scrapy
    const objActual = await scrapy(process.env.DOM_CHECKER_URL)
    //Obj almacenado en .env
    const objEsperado = JSON.parse(process.env.DOM_CHECKER_OBJ)

    //Si son iguales, volvemos. Comparamos strings, dan menos problemas
    if (JSON.stringify(objActual) == JSON.stringify(objEsperado)) {
        console.log("DOM unchanged");
        return
    }
    console.log("DOM changed!");

    //Continuamos si son diferentes
    for (el in objEsperado) {

        // el = itemNumber, imgURL, collectionName
        if (objEsperado[el] === objActual[el]) {
            //Son iguales
            fieldCollection.push(new Field(el, 'Unchanged 🟢', true))
        } else {
            //Son diferentes
            fieldCollection.push(new Field(el, 'Changed 🔴', true))
        }
    }

    // console.log(fieldCollection);
    await discordOpenseaError(fieldCollection)
}


const delayMins = process.env.DOM_CHECKER_DELAY
console.log(`Delay: ${delayMins} minutes\n`);

const loop = async () => {
    await executeScript();
    setTimeout(loop, delayMins * 60000);
}


console.log(`Checking DOM in ${process.env.DOM_CHECKER_URL}`);
discordScriptRunning()

loop();
