const Pagination = require('../../models/pagination');

class AdminUsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }

    async showUsersPage(req, res) {
        let pageInt = req.query.page? parseInt(req.query.page): 1;
        if(isNaN(pageInt)) return res.end('Invalid page query parameter! Must be an integer!');
    
        let usersCount = await this.usersRepository.getCountOfUsers();
        let usersData = await this.usersRepository.getPage(pageInt, 20);
        let pagination = new Pagination(20, pageInt, usersCount.count);
    
        res.render('admin-users', {
            page: pagination.createModel(),
            users: usersData
        });
    }
}

module.exports = AdminUsersService;