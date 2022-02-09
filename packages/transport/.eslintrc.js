module.exports = {
    rules: {
        // todo: remove when refactoring transport layer.
        'no-underscore-dangle': 'off',
        'no-restricted-syntax': 'off',
        'no-await-in-loop': 'off',

        // todo: maybe consider this rule globally?
        quotes: ['error', 'single', { avoidEscape: true }],
    },
};
