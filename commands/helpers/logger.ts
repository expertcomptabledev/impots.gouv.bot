const pkg = require('../../package.json');
const signale = require('signale');

export const logError = (...args) => {
    signale.error({
        prefix: pkg.name,
        message: args
    });
}
export const log = (...args) => {
    signale.log({
        prefix: pkg.name,
        message: args
    });
}
export const logJSON = (args, message?: string) => {
    const prettyjson = require('prettyjson');
    const options = {
        keysColor: 'yellow',
        dashColor: 'magenta'
    }
    signale.info({
        prefix: pkg.name,
        message: `${message || ''}\r\n${prettyjson.render(args, options)}`
    });
}

export const logSuccess = (...args) => {
    signale.success({
        prefix: pkg.name,
        message: args
    });
}

export const logWarn = (...args) => {
    signale.warn({
        prefix: pkg.name,
        message: args
    });
}

export const logPending = (...args) => {
    signale.pending({
        prefix: pkg.name,
        message: args
    })
}


