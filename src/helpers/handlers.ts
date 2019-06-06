export const pageClosedHandler = async (browser, timeout = 2000): Promise<any> => new Promise( async (resolve, reject) => {

    if(!browser) resolve();

    let done = false;
    setTimeout(() => {
        if(done === false) {
            reject(`Timeout fired`);
        }
    }, timeout);

    browser.on('targetdestroyed',async (target) => {
        resolve(target);
    });

});

export const newPageHandler = (browser, timeout = 2000): Promise<any> => new Promise(async (resolve, reject) => {

    let done = false;
    setTimeout(() => {
        if(done === false) {
            reject(`Timeout fired`);
        }
    }, timeout);

    browser.on('targetcreated',async (target) => {
        const p = await target.page();
        resolve(p);
    });

});