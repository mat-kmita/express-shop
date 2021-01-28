const bcrypt = require('bcrypt');

class AdminSessionService {
    constructor(adminRepository) {
        this.repository = adminRepository;
    }

    authenticateAdmin(req, res, next) {
        if (!req.session.adminSession) {
            return res.render('login', {
                action: '/admin/login'
            });
        }

        return next();
    }

    async handleAdminLogin(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        
        var user = await this.repository.get(username);
        console.log(`User in login: ${user}`);

        if (null === user)
            return res.render('login', {
                invalidInput: true,
                action: '/admin/login'
            });
        else {
            let isPasswordValid = await bcrypt.compare(password, user.password_hash);

            if (!isPasswordValid) {
                return res.render('login', {
                    invalidInput: true,
                    action: '/admin/login'
                });
            }
        }

        if (!req.session.adminSession) {
            req.session.adminSession = {
                user: user
            }
        }
        req.session.save((err) => {
            res.redirect('/admin');
        });
    }

    handleAdminLogout(req, res) {
        req.session.destroy((err) => {
            return res.redirect('/admin');
        });
    }
}

module.exports = AdminSessionService;