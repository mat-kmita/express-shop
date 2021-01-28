function createPaginationModel(pageSize, currentPage, elementsCount) {
    let result = {};
    if(elementsCount == 0) {
        result.empty = true;
    } else {
        result.empty = false;

        if(elementsCount <= pageSize) {
            result.showPreviousButton = false;
            result.showNextButton = false;
        } else {
            const maxPage = Math.ceil(elementsCount / pageSize);
            console.log(`Max page: ${maxPage}`);
            result.showPreviousButton = currentPage != 1;
            result.showNextButton = currentPage != maxPage;
        }
    }

    return result;
}

class AdminUsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }

    async showUsersPage(req, res) {
        let pageInt = req.query.page? parseInt(req.query.page): 1;
    
        let usersCount = await this.usersRepository.getCountOfUsers();
        let usersData = await this.usersRepository.getPage(pageInt, 20);
        let paginationModel = createPaginationModel(20, pageInt, usersCount.count);
    
        res.render('admin-users', {
            paginationModel: paginationModel,
            model: {
                page: pageInt,
                data: usersData
            }
        })
    }
}

module.exports = AdminUsersService;