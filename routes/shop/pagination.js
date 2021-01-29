class Pagination {
    constructor(pageLength, currentPage, elementsCount) {
        this.pageLength = pageLength;
        this.currentPage = currentPage;
        this.elementsCount = elementsCount;
    }

    createModel() {
        let result = {};

        if(this.elementsCount == 0) {
            result.empty = true;
        } else {
            result.empty = false;
    
            if(this.elementsCount <= this.pageLength) {
                result.isFirstPage = true;
                result.isLastPage = true;
            } else {
                const maxPage = Math.ceil(this.elementsCount / this.pageLength);
                result.isFirstPage = this.currentPage === 1;
                result.isLastPage = this.currentPage === maxPage;

                console.log(`Is first page: ${result.isFirstPage}, is last page: ${result.isLastPage}, max page: ${maxPage}`);
            }
        }
    
        result.currentPage = this.currentPage
        return result;
    }
}

module.exports = Pagination;