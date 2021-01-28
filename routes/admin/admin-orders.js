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

class AdminOrdersService {
    constructor(ordersRepository) {
        this.ordersRepository = ordersRepository;
    }

    async showOrdersPage(req, res) {
        let pageInt = req.query.page ? parseInt(req.query.page) : 1;

        let ordersCount = await this.ordersRepository.getCount();
        let ordersData = await this.ordersRepository.getPage(pageInt, 20);
        let paginationModel = createPaginationModel(20, pageInt, ordersCount.count);

        res.render('admin-orders', {
            paginationModel: paginationModel,
            model: {
                page: pageInt,
                data: ordersData
            }
        });
    }
}

module.exports = AdminOrdersService;