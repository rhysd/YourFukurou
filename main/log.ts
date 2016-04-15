import log = require('loglevel');
import messagePrefix = require('loglevel-message-prefix');

const prefixed_log = messagePrefix(log, {
    prefixFormat: process.platform !== 'win32' ? '\x1b[93m[%p]\x1b[0m: ' : '[%p]: ',
});

if (process.env.NODE_ENV === 'development') {
    prefixed_log.setLevel('debug');
} else {
    prefixed_log.setLevel('info');
}

export default prefixed_log;
