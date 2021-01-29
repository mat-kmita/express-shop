class RestrictedAccessService {

    allowLoggedIn(view, sessionValName) {
        return async (req, res, next) => {
            if(!req.session[sessionValName]) {
                return res.status(401).render(view);    
            }

            next();
        }
    }

}

module.exports = RestrictedAccessService;