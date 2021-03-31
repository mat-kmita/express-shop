# express-shop
Simple online shop application made with Express framework.

# Getting started
## General info
This applications lets users browse products in the shop and make orders.
Administrator panel is available under ```/admin``` route.


## Dependencies
To run this application you need to have installed:
* Node.js and npm
* PostgreSQL database server
* Redis

## Running it
To run this application use:
```
cd project_root/
npm install
node index.js
```
You need to manually add administrator user using PostgreSQL. It will be improved in the future.
You may need to specify proper database connection details in ```project_root/db/index.js``` file. It also will be improved in the future.
