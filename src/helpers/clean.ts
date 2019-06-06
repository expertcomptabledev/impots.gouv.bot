import { log } from "./logger";
import { pageClosedHandler } from "./handlers";

export const clean = async (browser) => {

    // log(`Cleaning pages`);

    const pages = await browser.pages()

    if(pages && pages.length > 0) {
        for (let i = 0; i < pages.length; i++) {
            const p = pages[i];
            if(p) {
                await Promise.all([
                    pageClosedHandler(browser),
                    p.close()
                ])
            }
        }
    }

    // log(`Cleaning browser`);

    if(browser) {
        await browser.close();
    }
    
};