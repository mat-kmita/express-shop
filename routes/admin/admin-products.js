const Pagination = require('../../models/pagination');

class AdminProductsService {
    constructor(productsRepository) {
        this.productsRepository = productsRepository;
    }

    async showProductsPage(req, res) {
        let pageInt = (!req.query.page)? 1: parseInt(req.query.page);
    
        let productsCount = await this.productsRepository.getCountOfProducts();
        let productsData = await this.productsRepository.getPage(pageInt, 10);

        let pagination = new Pagination(10, pageInt, productsCount.count);
    
        return res.render('admin-products', {
            page: pagination.createModel(),
            products: productsData
        });
    }
    
    async showNewProductPage(req, res) {
        res.render('admin-new-product', {
            product: {}
        });
    }
    
    async handleNewProduct(req, res) {
        let newProduct = {
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price) * 100
        }
    
        let result = await this.productsRepository.insert(newProduct);
    
        if(result == null) {
        }
    
        res.end('addedd new product!');
    }
    
    async showEditProductPage(req, res) {
        let productId = parseInt(req.params.productId);
        let productData = await this.productsRepository.get(productId);
    
        if(productData == null) return res.end('Invalid id!');
    
        let editedProduct = {
            name: productData.name,
            description: productData.description,
            price: productData.price / 100
        };
    
        res.render('admin-edit-product', {
            product: editedProduct
        });
    }
    
    async handleEditProduct(req, res) {
        let productId = parseInt(req.params.productId);
        let editedProduct = {
            name: req.body.name,
            description: req.body.description,
            price: parseInt(req.body.price) * 100
        }
        let result = await this.productsRepository.update(productId, editedProduct);
    
        if(result == null) {
            return res.end('Something wrong!');
        }
    
        res.end('finished editing!');
    }
    
    async handleDeleteProduct(req, res) {
        let productIdInt = parseInt(req.params.productId);
        let result = await this.productsRepository.delete(productIdInt);
    
        res.end('deleted');
    }
}


module.exports = AdminProductsService;