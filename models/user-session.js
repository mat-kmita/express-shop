const session = require("express-session")

class UserSession {
    constructor(session) {
        this.sessionVal = session.sessionValue? session.sessionValue : null
        this.session = session;
    }

    isUserLoggedIn() {
        return this.sessionVal != null;
    }

    getUserId() {
        if(sessionVal == null) {
            throw 'Cannot get id of user when there is no active session!';
        }

        return this.session.user.id;
    }

    getModel() {
        return {
            loggedIn: this.isUserLoggedIn,
            user: this.sessionVal.user
        }
    }

    logIn(user) {
        this.session.sessionValue = {
            user: user,
            cart: []
        }

        this.sessionVal = this.session.sessionValue;
        this.session.save((err) => {
            if(err) throw 'Cannot log in!';

            return;
        })
    }

    logout() {
        if(this.sessionVal == null) {
            throw 'No user logged in!';
        }

        this.session.destroy((err) => {
            if(err) throw 'Cannot log out!';

            return;
        });
    }
}

module.exports = UserSession;