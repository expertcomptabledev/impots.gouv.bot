// get tva and resultats informations
import { login } from './login';
import { TIMEOUT } from './const';
declare var document;
import { log, logError, logSuccess, logPending, logJSON, logWarn } from '../helpers/logger';
import { getFiscalAccount } from './get-fiscal-account';
import { getLink, typesDeclaration } from './declarations';
import { getFiscalLinks } from './get-fiscal-links';

import { clean } from '../helpers/clean';

export enum Impots {
    IS = 'IS',
    BIC = 'BIC',
    BNC = 'BNC'
}

export enum RegimesFiscaux {
    REEL_NORMAL = 'Réel simplifié d\'imposition',
    REEL_SIMPLIFIE = 'Réel normal',
    DECLARATION_CONTROLEE = 'Déclaration contrôlée'
}

export enum RegimesTVA {
    MINI_REEL = "Miniréel",
    REEL = "Réel normal",
    RSI = "Réel simplifié d'imposition"
}

export const getFiscalInformations = async (email: string, password: string, siren: string, close = true) => {
    
    const { browser, page } = await getFiscalAccount(email, password, siren);

    // get tva informations
    const links = await getFiscalLinks(page);
    await page.goto(await getLink(links, typesDeclaration.tva), { timeout: TIMEOUT });
    
    const title = await page.evaluate(() => {
        return document.querySelector('#titre').textContent;
    });

    // parse title : "Miniréel" "Réel normal" "Réel simplifié d'imposition" ? 
    const tva = getRegimeFromEnum(title, RegimesTVA);

    const linkRegimeFiscal = await getLink(links, 'DeclarationsRP');

    // go to page
    await page.goto(linkRegimeFiscal);
    const titleRegime = await page.evaluate(() => {
        return document.querySelector('#titre').textContent;
    });

    const impot = getRegimeFromEnum(linkRegimeFiscal, Impots);
    const regimeFiscal = getRegimeFromEnum(titleRegime, RegimesFiscaux);

    clean(browser);

    return { tva, impot, regimeFiscal };

};

export const getRegimeFromEnum = (text: string, myEnum) => {

    let res;
    Object.keys(myEnum)
        .map(key => {
            const val = myEnum[key];
            if(text.indexOf(val) > -1) {
                res = myEnum[key];
            }
        });

    return res;

}
