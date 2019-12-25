//connecting ot my datatbase


const mysql=require('mysql');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'ecommerce_web',
    password:'password'



});

module.exports=pool.promise();
