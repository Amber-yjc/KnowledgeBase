function getValues(selector, names) {
    const obj = {};
    names.forEach((key) => {
        const ele = document.querySelector(`${selector}[name=${key}]`);
        if (ele == null) {
            console.error('missing key: ' + key);
            return;
        }
        if (ele.value.length === 0) {
            return;
        }
        obj[key] = ele.value;
    });
    return obj;
}

async function callServer(method, url, params = {}) {
    method = method.toUpperCase();
    const body = method === 'GET' ? null : JSON.stringify(params);
    if (method === 'GET') {
        url += '?';
        for (const key of Object.keys(params)) {
            const value = params[key];
            url = url + key + '=' + value;
        }
    }
    const response = await fetch(url, {
        method,
        headers: {
            'content-type': 'application/json'
        },
        body
    });
    if (response.status >= 400) {
        const msg = await response.text();
        return alert(msg);
    }
    return response.text();
}

async function logout() {
    callServer('POST', '/user/logout');
    window.location = '/user';
}

function tohomepage() {
    window.location = '/user/homepage';
}

function fixDates() {
    const fullDates = document.getElementsByClassName("displayDate");
    Array.from(fullDates).forEach(date => date.innerText = moment.utc(date.innerText).utcOffset("-08:00").format("D MMM YYYY"))
    const displayMonthDay = document.getElementsByClassName("displayMonthDay");
    Array.from(displayMonthDay).forEach(date => date.innerText = moment.utc(date.innerText).utcOffset("-08:00").format("MMM D"))
    const displayMonthDayUpper = document.getElementsByClassName("displayMonthDayUpper");
    Array.from(displayMonthDayUpper).forEach(date => date.innerText = moment(date.innerText).format("MMM D").toUpperCase())
    const displayTime = document.getElementsByClassName("displayTime");
    Array.from(displayTime).forEach(date => date.innerText = moment.utc(date.innerText).utcOffset("-08:00").format("hh:mm a"))
}

fixDates();