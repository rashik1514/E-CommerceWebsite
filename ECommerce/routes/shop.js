const express=require('express');

const path=require('path');

const router=express.Router();

const rootDir=require("../util/path");

const adminData=require('./admin');
 //res.send("<h1>Hello from the other side</h1>");

   //res.sendFile(path.join(__dirname,'../','views','shop.html'));
 //  console.log(adminData.products);
  // res.sendFile(path.join(rootDir,'views','shop.html'));
 const productsController=require('../controller/products');
router.get('/',productsController.getProducts);// this is shop.pug used as default rendering template that be html in the browser





module.exports=router;