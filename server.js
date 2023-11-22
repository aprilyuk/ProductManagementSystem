const assert = require('assert');

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const mongoose = require('mongoose');
const itemSchema = require('./models/items');

const mongourl = 'mongodb+srv://s1298330:87654321@cluster0.alwdhci.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp'; 
const dbName = '381project';
const dbCol = 'Items'

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const session = require('cookie-session');
const SECRETKEY = 'akey';

var userAccount = new Array(
    {name: "admin1", password: "123456"},
    {name: "admin2", password: "123456"}
);

let currentItem = "";
let deleteMsg = "";

app.set('view engine', 'ejs');
app.use(session({
    userid: "session",
    keys: [SECRETKEY],
}));
app.use(express.json());
app.use(express.urlencoded());

const findItem = function(res, criteria, callback){
    mongoose.connect(mongourl);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
    db.once('open', async () => {
    	let Items = mongoose.model('Items', itemSchema);
    	try{
        	const searchResult = await Items.find(criteria).lean().exec();
        	//console.log(searchResult);
    		return callback(searchResult);
        }catch(err){
        	console.error(err);
        	console.log("Error occurred");
        }finally{
        	db.close();
        	console.log("Closed DB connection");
        }
    });
}

const updatePrice = function(criteria, updatePrice, callback){
    mongoose.connect(mongourl);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
	db.once('open', async () => {
		let Items = mongoose.model('Items', itemSchema);
		try{
			const updateValue={'price':updatePrice};
			const updateResult = await Items.updateOne(criteria,updateValue).exec();
			return callback(updateResult.acknowledged);
		}catch(err){
			console.error(err);
			console.log("Error occurred");
		}finally{
			db.close();
			console.log("Closed DB update connection")
		}
	});
}

app.get('/', function(req, res){
    if(!req.session.authenticated){
        console.log("user not authenticated; directing to login");
        res.redirect("/login");
    }else{
        res.redirect("/login");
    }
    console.log("Welcome back " + req.session.userid);
});

app.get('/login', function(req, res){
    console.log("...Welcome to login page.")
    res.sendFile(__dirname + '/public/login.html');
    return res.status(200).render("login");
});

app.post('/login', function(req, res){
    console.log("client:", req.body.username, req.body.password)
    for (const account in userAccount){
        console.log("...logging in");
        console.log("server:", userAccount[account]["name"], userAccount[account]["password"])
        if (userAccount[account]["name"] == req.body.username && userAccount[account]["password"] == req.body.password) {
        req.session.authenticated = true;
        req.session.userid = userAccount[account]["name"];
        console.log(req.session.userid);
        return res.status(200).redirect("/home");
        }
    }
    console.log("Wrong username or password.");
    return res.redirect("/");
});

app.get('/logout', function(req, res){
    req.session.authenticated = false;
    res.redirect('/login');
});

app.get('/home', function(req, res){
    console.log("...Welcome to the home page!");
    findItem(res,{}, function(foundProduct){
        var amount = foundProduct.length;
        var price = 0;
        for (var item in foundProduct){
        	price+=foundProduct[item]["price"];
        }
        return res.status(200).render("home", {msg:deleteMsg, price: price, amount: amount, foundProduct: foundProduct});
    });
});

app.get('/search', function(req, res){
    console.log("...Welcome to the search page!");
    return res.status(200).render("search", {msg:""});
});

app.post('/detail', function(req, res){
    const criteria = {};
    if (req.body.itemID){
    	criteria['id'] = req.body.itemID;
    }
    findItem(res,criteria, function(oneItem){
    	if (oneItem.length>=1){
    		currentItem = oneItem;
    		return res.status(200).render('detail', {msg:'Product:  ',foundProduct: oneItem});
    	}else{
    		return res.status(200).render('search', {msg:'This Product id does not exist!'});
    	}
    });
});

app.get('/create', function(req, res){
    console.log("...Welcome to the create page!");
    return res.status(200).render("create", {message:""});
});

app.post('/create', function(req, res){
    mongoose.connect(mongourl);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
    db.once('open', async () => {
    	const Item = mongoose.model('Items',itemSchema);
    	try{
       	    let items={};
            items["id"] = req.body.itemID;	
            items['name']= req.body.name;
            items['description']= req.body.desc;
            items['category']= req.body.category;
            items['price']= req.body.price;
            const newItem = new Item(items);
            const createItem = await newItem.save();
            console.log(createItem);
            console.log('Item created!');
            return res.status(200).render("create", {message:"Product is created successfully!"});
        }catch (err){
            console.error(err);
            return res.status(200).render("create", {message:"Producted create failed!"});
        } finally{
            db.close();
        }    
    });
});

app.get('/update', function(req,res) {
    console.log("...Welcome to the update page!");
    let criteria={};
    criteria['id']=currentItem[0].id;
    findItem(res,criteria, function(oneItem){
    	currentItem = oneItem;
    	return res.status(200).render('update', {msg:'',foundProduct: oneItem});
	});
});

app.post('/update', function(req, res){
	mongoose.connect(mongourl);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
	db.once('open', async () => {
		let Items = mongoose.model('Items', itemSchema);
		try{
			let originalItem={};
			originalItem['id']=currentItem[0].id;
			const updateValue={'price':Number(req.body.price)};
			const updateResult = await Items.findOneAndUpdate(originalItem,updateValue,{new: true});
			console.log(updateResult);
			return res.status(200).render("detail", {msg:`Product price is updated to ${req.body.price}`,foundProduct:[updateResult]});
			
		}catch(err){
			console.error(err);
			console.log("Error occurred");
		}finally{
			db.close();
			console.log("Closed DB update connection")
		}
	});
});


app.get('/delete', function(req, res){
    mongoose.connect(mongourl);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
	db.once('open', async () => {
	    try{
		let Items = mongoose.model('Items', itemSchema);
    		let criteria={};
    		criteria['id'] = currentItem[0].id;
    		const deleteResult = await Items.findOneAndDelete(criteria);
    		console.log(deleteResult);
    		deleteMsg=`Item ${currentItem[0].id} is successfully deleted.`;
    		return res.status(200).redirect("/home");
    	    }catch(err){
    		console.error(err);
    		console.log("Error occurred");
    	    }finally{
    		db.close();
    		console.log("Closed DB delete connection")
    	    }
	});
});

app.post("/api/item/insert", function(req,res) {
    if ( !req.params.itemID) {
	return res.status(500).json({"error": "missing itemID"});
    }
    mongoose.connect(mongourl);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
    db.once('open', async () => {
    	const Item = mongoose.model('Items',itemSchema);
    	try{
            const newItem = new Item(req.body);
            const createItem = await newItem.save();
            console.log(createItem);
            console.log('Product created!');
            return res.status(200).json({"message": "product created successfully"});
        }catch (err){
            console.error(err);
            return res.status(500).json({"error": "missing information"});
        } finally{
            db.close();
        }    
    });
})

app.get("/api/item/find/:itemID", function(req,res) {
    if (req.params.itemID) {
        let criteria = {};
        criteria["id"] = req.params.itemID;
        findItem(res, criteria, function(foundProduct){
            return res.status(200).json(foundProduct);
        });
    } else {
        res.status(500).json({"error": "missing product ID"});
    }
})

app.get("/api/item/list", function(req, res) {
    let criteria = {};
    findItem(res, criteria, function(foundProduct){
        return res.status(200).json(foundProduct);
    });
})

app.put('/api/item/update/:itemID/:price', function(req, res){
    if ( !req.params.itemID || !req.params.price) {
	return res.status(500).json({"error": "missing information"});
    }
    mongoose.connect(mongourl);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
        db.once('open', async () => {
		let Items = mongoose.model('Items', itemSchema);
		try{
			let originalItem={};
			originalItem['id']=req.params.itemID;
			const updateValue={'price':Number(req.params.price)};
			const updateResult = await Items.findOneAndUpdate(originalItem,updateValue,{new: true});
			console.log(updateResult);
			return res.status(200).json({"message":"product price updated successfully"});
			console.log("update success")
		}catch(err){
			console.error(err);
			console.log("Error occurred");
		}finally{
			db.close();
			console.log("Closed DB update connection")
		}
	});
});

app.delete("/api/item/delete/:itemID", function(req,res){
    if (req.params.itemID) {
        let criteria = {};
        criteria["id"] = req.params.itemID;
        const client = new MongoClient(mongourl);
        client.connect(function(err){
            assert.equal(null, err);
            console.log("Server connected successfully");
            const db = client.db(dbName);

            db.collection("items").deleteMany(criteria, function(err,results) {
                assert.equal(err,null)
                client.close()
                res.status(200).json({"msg": "product deleted successfully"});
            })
        });
    } else {
        res.status(500).json({"error": "missing product ID"});       
    }
})

app.listen(process.env.PORT || 8099);
