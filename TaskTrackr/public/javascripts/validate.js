function setValid(control){
    $(`#${control}`).addClass("is-valid").removeClass("is-invalid");
}

function setInvalid(control){
    $(`#${control}`).addClass("is-invalid").removeClass("is-valid");
}

function setState(control, valid){
    if (valid){
        setValid(control);
        return;
    }
    setInvalid(control);
}

function validateString(str){
    if(str && str !== '')
    {
        return str.length >= 3;
    }
    return undefined;
}

function validateEmail(email) {
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
}