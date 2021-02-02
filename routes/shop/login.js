const UserSession = require('../../models/user-session');
const bcrypt = require('bcrypt');

class LoginService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    handleAlreadyLoggedIn(req, res, next) {
        let session = new UserSession(req.session);

        if(session.isUserLoggedIn()) {
            return res.redirect('/');
        }

        next();
    }

    showLoginPage(req, res) {
        const welcome = req.query.welcome? parseInt(req.query.welcome) === 1: false;

        return res.render('login', {
            action: '/login',
            welcome: welcome
        })
    }

    async handleLogin(req, res) {
        let session = new UserSession(req.session);

        var username = req.body.username;
        var password = req.body.password;
    
        var user = await this.userRepository.get(username);
    
        if( null === user)
            return res.render('login', {
                invalidInput: true,
                action: '/login'
            });
        else {
            let isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
            if(!isPasswordValid) {
                return res.render('login', {
                    invalidInput: true,
                    action: '/login'
                });
            }
        }
    
        if(!session.isUserLoggedIn()) {
            try {
                session.logIn(user, () => {
                    console.log('will redirect back!');
                    return res.redirect('back');
                });
            } catch(err) {
                console.error('Cannot log in!');
                return res.render('login', {
                    invalidInput: true,
                    action: '/login'
                });
            }
        }
    }

    handleLogout(req, res) {
        const session = new UserSession(req.session);
        
        try {
            session.logout( () => {
                return res.redirect('back');
            });
        } catch(err) {
            console.error('Error in logout!');
            console.error(err);
        }
    }
}

module.exports = LoginService;