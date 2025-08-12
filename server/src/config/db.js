const mysql2 = require("mysql2/promise");
require("dotenv").config();

const connection = mysql2.createPool({
    user : process.env.DB_USER,
    host : process.env.DB_HOST,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 20,
})

connection.getConnection((err,conn) => {
    if(err){
        console.log("Error connecting the database",err)
    }
    else{
        console.log("connected to database");
        conn.release();
    }
})

module.exports = connection;
