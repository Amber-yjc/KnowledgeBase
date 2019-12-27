async function signup1() {
    const requiredKeys = ['email', 'firstname', 'lastname'];
    const requiredValues = getValues('#signup-form1 ', requiredKeys);
    let missed = false;
    for (const key of requiredKeys) {
        const v = requiredValues[key];
        if (v == null || v.trim().length === 0) {
            missed = true;
            break;
        }
    };
    if (missed) {
        document.querySelector('#signup_err').textContent = 'Missing Required Value'
        return;
    }
    document.querySelector('#signup_err').textContent = ''

    document.querySelector('#first-login').style.display = 'none';
    document.querySelector('#signup-form1').style.display = 'none';
    document.querySelector('#signup-form2').style.display = '';
    document.querySelector('#kb-image').style.display = 'none';
    document.querySelector('#intro-text').style.display = 'none';
    document.querySelector('#intro-text2').style.display = '';
    const btn = document.createElement('button')
    btn.classList.add('signupBtn')
    btn.textContent = 'Complete Registration'
    document.querySelector('#signup-form2').append(btn);
}

async function checkPassword() {
    let pw1 = document.querySelector('#pass').value;
    let pw2 = document.querySelector('#pass2').value;
    if (pw1 && pw2) {
        if ((pw1 !== pw2)) {
            document.querySelector('#signup1_btn').disabled = true;
            document.querySelector('#signup_err').textContent = 'Confirme password does not match'
        } else {
            document.querySelector('#signup1_btn').disabled = false;
            document.querySelector('#signup_err').textContent = ''
        }
    }
}
