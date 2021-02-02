class RestrictedAccessService {

    allowLoggedIn(view, sessionValName) {
        return async (req, res, next) => {
            if(!req.session[sessionValName]) {
                return res.status(401).end('Musisz się zalogować, żeby to wykonać!');  
            }

            next();
        }
    }

}

module.exports = RestrictedAccessService;