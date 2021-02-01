const minPasswordLength = 7;
const maxPasswordLength = 50;

const minUsernameLength = 3;
const maxUsernameLength = 30;

let isPasswordValid = (pass) => {
    return pass.length >= minPasswordLength && pass.length <= maxPasswordLength;
}

let isUsernameValid = (username) => {
    return username.length >= minUsernameLength && username.length <= maxUsernameLength;
}

let arePasswordsEqual = (password1, password2) => {
    return password1 === password2;
}

let validateRegistrationForm = (form) => {
    let passwordValidation= isPasswordValid(form.password);
    let usernameValidation = isUsernameValid(form.username);
    let passwordsEqualValidation = arePasswordsEqual(form.password, form.passwordRepeated);

    let validationResult = {
        isValid: true
    };

    if(!passwordValidation) {
        validationResult.isValid = false;
        validationResult.passwordError = true;
    }
    if(!usernameValidation) {
        validationResult.isValid = false;
        validationResult.usernameError = true;
    } 
    if(!passwordsEqualValidation) {
        validationResult.isValid = false;
        validationResult.passwordsEqualError = true;
    }

    return validationResult;
}

let validateProduct = (product) => {
    if(!product.name || product.name.length < 5) {
        return false
    } else if(!product.description || product.description.length < 5) {
        return false;
    }  else if(!product.price) {
        return false;
    }

    let re = new RegExp('^(?:0|(?:[1-9][0-9]*?))(?:(?:.|,)[0-9]{1,2})?$', 'gm');
    return re.test(product.price);
}

let validQuantity = (quantity) => {
    return Number.isInteger(quantity) && quantity >= 0;
}

module.exports = {
    validateRegistrationForm: validateRegistrationForm,
    validateProduct: validateProduct,
    validQuantity: validQuantity
}