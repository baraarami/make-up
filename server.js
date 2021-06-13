'use strict '

const express=require('express');
const pg=require('pg');
const methodOverride=require('method-override');
const superagent=require('superagent');
const cors=require('cors');
const { saveCookies } = require('superagent');
require('dotenv').config();


const server = express();
const PORT = process.env.PORT || 6000;



server.use(express.urlencoded({extended:true}));
server.use(express.static('public'));
server.use(methodOverride('_method'));
server.set('view engine' , 'ejs');
server.use(cors());

const client = new pg.Client(process.env.DATABASE_URL);
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
// const client = new pg.Client( { connectionString: process.env.DATABASE_URL, ssl: process.env.LOCALLY ? false : {rejectUnauthorized: false}} );


server.get('/' , homehandeler);
server.post('/searches' , searchhandeler);
server.get('/search' , searchpage);
server.get('/mycard' , cardhandeler);
server.post('/addtocard' , addtocard);
server.get('/detailes/:id' , getdetailes);
server.put('/update/:id' , update);
server.delete('/delete/:id' , deletehhandeler);


function homehandeler(req,res){
    let URL =`http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline`;
    superagent.get(URL)
    .then(data=>{
        let array=data.body.map(item =>
            new product(item))
            res.render('index' , {data:array});
    }).catch(error=>{
        console.log(error);
    });
}

function searchhandeler(req,res){
    let type=req.body.type;
    let URL=`http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline&descreption=${type}`;
    superagent.get(URL)
    .then(data=>{
        let array=data.body.map(item =>
            new newprodect (item))
            res.render('result' , {data:array});
    }).catch(error=>{
        console.log(error);
    });
}

function searchpage(req,res){
    res.render('result');
}


function cardhandeler(req,res){
    let SQL=`SELECT * FROM exam`;
    client.query(SQL)
    .then(data=>{
        res.render('mycard' , {data:data.rows});
    }).catch(error=>{
        console.log(error);
    });
}


function addtocard(req,res){
    let { name, price, image, description}=req.body;
    let safevalue=[ name, price, image, description];
    let SQL=`INSERT INTO exam (name, price, image, description) VALUES($1 , $2 ,$3 , $4 ) RETURNING* ;`;
    client.query(SQL, safevalue)
    .then(()=>{
        res.redirect('/mycard');
    }).catch(error=>{
        console.log(error);
    });
}

function getdetailes(req,res){
    let SQL=`SELECT * FROM exam WHERE id=$1`;
    let value=[req.params.id];
    client.query(SQL , value)
    .then(data=>{
        res.render('detailes' , {data:data.rows});
    }).catch(error=>{
        console.log(error);
    });
}


function update(req,res){
    let SQL=`UPDATE exam SET name=$1 , price=$2 , image=$3 , description=$4 WHERE id=$5 `;
    let { name, price, image, description}=req.body;
    let safevalue=[ name, price, image, description , req.params.id];
    client.query(SQL, safevalue)
    .then(
        data=>{
            res.redirect(`/detailes/${req.params.id}`);
        }
    ).catch(error=>{
        console.log(error);
    });
}

function deletehhandeler(req,res){
    let SQL=`DELETE FROM exam WHERE id=$1`;
    client.query(SQL , [req.params.id])
    .then(data=>{
        res.redirect(`/mycard`)
    }).catch(error=>{
        console.log(error);
    });
}



function product(data){
    this.name=data.name;
    this.price=data.price;
    this.image=data.image;
    this.description=data.description
}

function newprodect(data){
    this.name=data.name;
    this.price=data.price;
    this.image=data.image;
    this.description=data.description
}
client.connect()
.then(()=>{
   server.listen(PORT , ()=>
   console.log(`listinig in PORT: ${PORT}`)
   )
}
);