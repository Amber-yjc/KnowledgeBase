const { validationResult } = require('express-validator');

const getLocationByMethod = (method) => {
    switch (method) {
        case 'GET':
            return 'query';
        default:
            return 'body';
    }
}

const validateInput = (schema) => {
    return (req, res, next) => {
        const errors = [];
        const location = getLocationByMethod(req.method);
        // validate each property in the schema
        for (let k in schema) {
            const validator = schema[k];

            const input = req[location][k];
            const result = validator(input);

            if (result.pass === false) {
                errors.push({
                    location,
                    param: k,
                    value: input,
                    msg: result.msg
                });
            } else {
                if (result.value) {
                    req[location][k] = result.value;
                } else if (result.msg === 'optional parameter') {
                    req[location][k] = undefined;
                }
            }
        }
        // if there is errors, report the errors to front-end
        // continue otherwise
        if (errors.length !== 0) {
            res.redirect(req.get('referer'));
        } else {
            next();
        }
    };
};

/**
 * Validate the input using express-validator
 * @param validation the validation that needs to take place
 */
const expressValidateInput = (validation) => {
    return [...validation, (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        } else {
            next();
        }
    }];
};

module.exports = { validateInput, expressValidateInput };