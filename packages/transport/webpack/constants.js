const path = require('path');

const ABSOLUTE_BASE = path.normalize(path.join(__dirname, '..'));

const constants = Object.freeze({
    BUILD: path.join(ABSOLUTE_BASE, 'build/'),
    SRC: path.join(ABSOLUTE_BASE, 'src/'),
    PORT: 8090,
    UI: path.join(ABSOLUTE_BASE, 'ui'),
});

module.exports = { ...constants, ABSOLUTE_BASE };
