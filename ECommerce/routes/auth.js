const express=require('express');

const path=require('path');

const router=express.Router();

const db=require('../util/database');

///productsController.getProducts);{
router.get('/auth/sign_in',(req,res,next)=>{
    res.render('login', {
        docTitle: 'Add-product', 
        path:'/auth/sign_in',
        activeAddProduct: false,
        activeShop: false,
        productCSS: true
        });


});

// ? didnt work baby

router.post('/auth/verify',(req,res,next)=>{
    
  const name=req.body.ucid;
  const pass=req.body.password;
 
  var query1='SELECT * FROM credentials WHERE password= '+db.escape(pass)+'AND id='+db.escape(name);

   db.execute(query1,function(err,result){
     console.log(result);
   });



});


module.exports=router;