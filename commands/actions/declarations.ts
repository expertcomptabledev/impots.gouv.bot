import { getFiscalAccount } from './get-fiscal-account';
import { getFiscalLinks } from './get-fiscal-links';
import { log, logError, logSuccess, logPending, logJSON, logWarn } from '../helpers/logger';
import { TIMEOUT } from './const';
declare var document, fetch;
var PromisePool = require('es6-promise-pool');
const { mkdirSync, existsSync, writeFile } = require('fs')
const { join } = require('path');
const { promisify } = require('util');
const CLI = require('clui');
const Spinner = CLI.Spinner;
var flat = require('array.prototype.flat');

const typesDeclaration = {
    'tva': 'DeclarationsTVA',
}

export const declarations = async (type: string, email: string, password: string, siren: string, save = false, out = undefined, close = true) => {

    if(!typesDeclaration[type]){
        throw new Error('Declaration type not valid');
    } else {
        type = typesDeclaration[type];
    }

    const status = new Spinner('Getting declarations, please wait...');
    status.start();

    const clean = async (browser, page) => {
        await page.close();
        await browser.close();
    }

    const getLink = (links: Array<string>, _type: string) => {
        if(Array.isArray(links)){
            return links.filter(l => l.indexOf(_type) > -1)[0] || null;
        } else {
            throw new Error('No links provided')
        }
    }

    const { browser, page } = await getFiscalAccount(email, password, siren, false);

    try {
    
        const links = await getFiscalLinks(page);

        // log('got all fiscal links here :')
        // logJSON(links);

        await page.goto(await getLink(links, type), { timeout: TIMEOUT });

        // get all tva declarations
        const declarations = flat(await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.tableau_pliable'))
                .map((tableau: any) => {

                    // année dans child h1 > span
                    let year = tableau.querySelector('h1 > span').textContent.trim().match(/\d{4}/g);
                    if(Array.isArray(year) && year.length === 1) {
                        year = year[0];
                    }

                    // déclaration dans les tr SAUF la première qui contient les entêtes
                    const lines = tableau.querySelectorAll('tr');

                    const getPeriod = (periodText) => {
                        if(periodText.indexOf("«") > -1){
                            periodText.split("«")[0]
                        } else {
                            return periodText;
                        }
                    }

                    const getReceiptCode = (periodText) => {
                        if(periodText.indexOf("«") > -1){
                            periodText.split("«")[1].slice(0, -1)
                        } else {
                            return periodText;
                        }
                    }

                    const declarations = [];
                    for (let index = 1; index < lines.length; index++) {
                        const line = lines[index];
                        // get td
                        const cells = line.querySelectorAll('td');
                        declarations.push({
                            year: year,
                            period: getPeriod(cells[0].textContent.trim()),
                            receiptCode: getReceiptCode(cells[0].textContent.trim()),
                            taxSystem: cells[1].textContent.trim(),
                            type: cells[2].textContent.trim(),
                            depositMode: cells[3].textContent.trim(),
                            depositDate: cells[4].textContent.trim(),
                            amount: cells[5].textContent.trim(),
                            declarationLink: cells[0].querySelectorAll('a')[0].href,
                            receiptLink: cells[0].querySelectorAll('a')[1] ? cells[0].querySelectorAll('a')[1].href : undefined
                        })
                    }

                    return declarations;

                });
        }));

        // construct list
        const linksToScrap = [];
        declarations.forEach(declaration => {
            linksToScrap.push(declaration.receiptLink);
            linksToScrap.push(declaration.declarationLink);
        });

        if(save === true){

            // logJSON(linksToScrap);
            await page.setDefaultNavigationTimeout(30 * 1000 * 2);

            let count = 0, concurrency = 3;
            var promiseProducer = function () {

            if(count < linksToScrap.length) {
                count++;
                return getDocument(browser, linksToScrap[count - 1], out); // TODO : better log avancement
                } else {
                    return null;
                }

            }

            var pool = new PromisePool(promiseProducer, concurrency);
            await pool.start();

        }

        status.stop();

        if(close === true){
            await clean(browser, page);
            return declarations;
        } else {
            return { browser, page };
        }

    } catch (error) {
        status.stop();
        await clean(browser, page);
        throw error;
    }

}

export const getDocument = async (browser, link, out = './out') => {

    if(!link) return;

    const page = await browser.newPage();

    // logPending(`Get document ${link}`)

    await page.goto(link, {
        timeout: TIMEOUT,
        waitUntil: 'domcontentloaded'
    })

    const menuSelector  ='#menuPdf > ul a';

    try {
        await page.waitForSelector(menuSelector, { timeout: 10000 });
    } catch (error) {
        logError('can\t load print menu');
    }

    // get all links in impression menu
    const links = await page.evaluate((menuSelector) => {
        return Array.from(document.querySelectorAll(menuSelector))
            .map((node: any) => node.href)
            .filter(function(item, pos, self) {
                return self.indexOf(item) == pos;
            })
    }, menuSelector);

    // get impression link
    let linkPrint = links.filter(l => l.indexOf("lancerImpression") > -1)[0] || null;

    if(!linkPrint){
        return null;
    } else {

        // TODO: distinct if link contain lancerImpression auquel ca il faut attendre une redirection
        const response = await page.goto(linkPrint, { timeout: TIMEOUT, waitUntil: 'domcontentloaded' });
        const myUrl = await response.url();
        // logJSON(myUrl);

        const params =  require('querystring').parse(myUrl);

        // logJSON(params);
        const idPdf = params.idPdf;
        // log(`pdfId : ${idPdf}`)

        await page.waitForFunction((pdfId) => {

            if(!pdfId) return false;
            
            const res = Array.from(document.querySelectorAll('.outil a'))
                .map((node: any) => node.href)
                .filter(a => a.indexOf(pdfId) > -1 && a.indexOf('getPdf') > -1)
            
                return res.length > 0;

        }, { timeout: 60000, polling: 100}, idPdf)

        // print asked wait to recuperate
        const downloadLink = await page.evaluate((pdfId) => {
            
            return Array.from(document.querySelectorAll('.outil a'))
                .map((node: any) => node.href)
                .filter((a) => a.indexOf(pdfId) > -1)[0];

        }, idPdf)

        // log(`Got link to download pdf ${idPdf} :`)
        // log(downloadLink)

        let file = await page.evaluate((downloadLink) => {
            const bufferToArray = buffer => (<any>Object).values(new Uint8Array(buffer))
            return fetch(downloadLink, { credentials: 'include' })
                .then(response => response.arrayBuffer())
                .then(buffer => bufferToArray(buffer))
        }, downloadLink);

        if (!existsSync(out)) mkdirSync(out);

        const arr = new Uint8Array(file)
        const buffer = Buffer.from(arr);
        const filename = join(process.cwd(), `${out}/${idPdf}.pdf`)
        const write = promisify(writeFile)
        await write(filename, buffer);

        page.close();

        return { link, idPdf, filename };

    }

}