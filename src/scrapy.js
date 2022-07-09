const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { discordError } = require('./discord.js')

puppeteer.use(StealthPlugin())

const scrapy = async (url) => {
    // export async function scrapy() {
    // puppeteer usage as normal
    const result = await puppeteer.launch({ headless: true }).then(async browser => {
        // console.log('Getting collection data...')
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
                name: 'Message',
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
            const elements = document.getElementsByTagName('title');

            return elements[0].text.split(' - ')[0]
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

//Export como module
module.exports = scrapy

