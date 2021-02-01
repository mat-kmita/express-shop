class RestrictedAccessService {

    allowLoggedIn(view, sessionValName) {
        return async (req, res, next) => {
            if(!req.session[sessionValName]) {
                return res.redirect('/login')   
            }

            next();
        }
    }

}

module.exports = RestrictedAccessService;