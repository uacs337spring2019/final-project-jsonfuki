const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const fs = require("fs");

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use(express.static('public'));


app.get("/", function(req,res){
	res.header("Access-Control-Allow-Origin", "*");
	let mode = req.query.mode;

	if(mode === "gallery"){
		res.send(JSON.stringify(getImages(mode)));
	}else if(mode === "aboutme"){	
		res.send(JSON.stringify(getAboutme(mode)));
	}

})

/**
 * Returns the text inside the folder where the aboutme.txt is located
 */
function getAboutme(mode){
	return fs.readFileSync(mode+"/"+mode+".txt", "utf8");
}

/**
 * Returns a JSON object with all the images
 */
function getImages(mode){
	console.log(mode);
	let jsonImages = {};
	let img = [];
	let imgFolder = fs.readdirSync(mode+"/");
	for (let i=0; i<imgFolder.length; i++){
		img.push(mode+"/"+imgFolder[i]);
	}
	jsonImages["images"] = img;
	console.log(jsonImages);
	return jsonImages;
}

app.listen(3000);