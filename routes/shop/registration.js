const bcrypt = require('bcrypt');
const validators = require('../../validators');

class RegistrationService {
    constructor(hashingRounds, userRepository) {
        this.hashingRounds = hashingRounds;
        this.userRepository = userRepository;
    }

    showRegistrationPage(req, res) {
        res.render('register', {
            action: '/register'
        });
    }

    async handleRegistration(req, res) {
        let form = {
            username: req.body.username,
            password: req.body.password,
            passwordRepeated: req.body.passwordRepeated
        };

        let validationResult = validators.validateRegistrationForm(form);
        if (!validationResult.isValid) {
            return res.render('register', {
                usernameError: validationResult.usernameError,
                passwordError: validationResult.passwordError,
                passwordRepeatError: validationResult.passwordsEqualError,
                action: '/register'
            });
        }

        let passwordHash = await bcrypt.hash(req.body.password, this.hashingRounds);
        let result = await this.userRepository.insert({
            username: req.body.username,
            passwordHash: passwordHash
        });

        if (!result)
            return res.render('register', {
                usernameTaken: true,
                action: '/register'
            });

        res.redirect('/login?welcome=1');
    }
}

module.exports = RegistrationService;