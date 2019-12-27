const createRequireable = (validator, requireCheck) => {
    let requireable = ((value) => {
        if (value == null || (requireCheck && !requireCheck(value))) {
            return {
                pass: true,
                msg: "optional parameter"
            };
        }
        return validator(value);
    });

    const requireValidator = (value) => {
        if (value == null || (requireCheck && !requireCheck(value))) {
            return {
                pass: false,
                msg: 'The value is required'
            };
        }
        return requireable(value);
    };
    requireable.isRequired = requireValidator;

    return requireable;
};

const PASSED_MSG = "passed validation";

const ParamTypes = {
    string: createRequireable((value) => {
        return typeof value === 'string' || value instanceof String ?
            { pass: true, msg: PASSED_MSG } :
            { pass: false, msg: "The value is not a string" };
    }, (value) => {
        return typeof value === 'string' && value.length !== 0;
    }),
    number: createRequireable((value) => {
        if (typeof value === 'number' || value instanceof Number) {
            return { pass: true, msg: PASSED_MSG }
        }
        const num = Number(value);
        return isNaN(num) ?
            { pass: false, msg: "The value is not a number" } :
            { pass: true, value: num, msg: PASSED_MSG };
    }, (value) => {
        return typeof value === 'string' && value.length !== 0;
    }),
    any: createRequireable((value) => {
        return { pass: true, msg: PASSED_MSG };
    }),
    array: createRequireable((value) => {
        if (value instanceof Array) {
            return { pass: true, msg: PASSED_MSG }
        }
        try {
            const arr = JSON.parse(value);
            if (arr instanceof Array) {
                return { pass: true, value: arr, msg: PASSED_MSG };
            }
        } catch (e) { }
        return { pass: false, msg: "The value is not an array" }
    }),
    bool: createRequireable((value) => {
        if (typeof value === 'boolean' || value instanceof Boolean) {
            return { pass: true, msg: PASSED_MSG }
        }
        let bool = null;
        switch (value) {
            case 'true':
                bool = true;
                break;
            case 'false':
                bool = false;
                break
        }
        return bool === null ?
            { pass: false, msg: "The value is not a boolean, use true/false as the value" } :
            { pass: true, value: bool, msg: PASSED_MSG };
    }, (value) => {
        return typeof value === 'string' && value.length !== 0;
    }),
    date: createRequireable((value) => {
        if (value instanceof Date && !isNaN(value.getTime())) {
            return { pass: true, msg: PASSED_MSG }
        }
        const isValidInput = ParamTypes.oneOfType([
            ParamTypes.string,
            ParamTypes.number
        ])(value);
        if (isValidInput.pass !== false) {
            try {
                const date = new Date(value);
                if (date instanceof Date && !isNaN(date.getTime())) {
                    return { pass: true, value: date, msg: PASSED_MSG };
                }
            } catch (e) { }
        }
        return { pass: false, msg: "The value is not a valid date" }
    }, (value) => {
        return typeof value === 'string' && value.length !== 0;
    }),
    object: createRequireable((value) => {
        if (typeof value === 'object' && value !== null) {
            return { pass: true, msg: PASSED_MSG }
        }
        try {
            const obj = JSON.parse(value);
            if (typeof obj === 'object' && obj !== null) {
                return { pass: true, value: obj, msg: PASSED_MSG };
            }
        } catch (e) { }
        return { pass: false, msg: "The value is not an object" }
    }, (value) => {
        return typeof value === 'string' && value.length !== 0;
    }),
    arrayOf: (type) => createRequireable((value) => {
        const result = ParamTypes.array(value);
        if (!result.pass) {
            return { pass: false, msg: "The value is not an array" }
        }

        const arr = result.value || value;
        for (let i = 0; i < arr.length; i++) {
            const singleResult = type(arr[i]);
            if (!singleResult.pass) {
                return { pass: false, msg: "The array contains unexpected value type: " + singleResult.msg }
            } else {
                if (singleResult.value) {
                    arr[i] = singleResult.value;
                }
            }
        }
        return { pass: true, value: arr, msg: PASSED_MSG };
    }),
    shape: (schema) => createRequireable((value) => {
        const result = ParamTypes.object(value);
        if (!result.pass) {
            return { pass: false, msg: "The value is not an object" }
        }

        const obj = result.value || value;
        for (let k in schema) {
            const validator = schema[k];
            const val = obj[k];

            const singleResult = validator(val);
            if (!singleResult.pass) {
                return { pass: false, msg: `The object does not match shape:  ${val} => ${singleResult.msg}` }
            } else {
                if (singleResult.value) {
                    obj[k] = singleResult.value;
                }
            }
        }
        return { pass: true, value: obj, msg: PASSED_MSG };
    }),
    oneOf: (validValues) => createRequireable((value) => {
        for (let validValue of validValues) {
            if (value === validValue) {
                return { pass: true, msg: PASSED_MSG };
            }
        }
        return { pass: false, msg: 'The value must be one of ' + validValues };
    }),
    oneOfType: (types) => createRequireable((value) => {
        for (let type of types) {
            const result = type(value);
            if (result.pass) {
                return result;
            }
        }
        return { pass: false, msg: 'The value must be one of the required type' }
    })
};

module.exports = { ParamTypes };