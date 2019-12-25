const express= require('express');

const path= require('path');

const router= express.Router();

const rootDir=require("../util/path");

//  res.send('<form action="/product" method="POST"><input type="text" name="title"><button type="submit">Add product</button></form>'); // sends a url
    //back that is of form
    //res.sendFile(path.join(__dirname,'../','views','add-product.html'));
  //  res.sendFile(path.join(rootDir,'views','add-product.html'));
 



// allows to use middle ware funciton

const productsController=require('../controller/products');
router.get('/add-product',productsController.getAddProduct);   


router.post('/add-product',productsController.postAddProduct);


module.exports=router;
