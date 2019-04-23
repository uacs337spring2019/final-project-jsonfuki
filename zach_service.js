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
	let temp = null;
	
	if(mode === "gallery" || mode === "slideshow"){
		temp = JSON.stringify(getImages(mode));
		//res.send(JSON.stringify(getImages(mode)));
	}else if(mode === "aboutme"){
		temp = JSON.stringify(getAboutme(mode));
		//res.send(JSON.stringify(getAboutme(mode)));
	}else if(mode === "appointments"){
		temp = JSON.stringify(getSchedule(mode));
		//res.send(JSON.stringify(getSchedule(mode)));
	}
	res.send(temp);
})


app.post('/', jsonParser, function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	let first = req.body.name;
	let last = req.body.last;
	let date = req.body.date;
	let mode = req.body.mode;

	console.log("HELLO");
	console.log(first +" "+last+" "+date+" "+mode);
	//fs.appendFile()
	res.send("POST");
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
	let jsonImages = {};
	let img = [];
	let imgFolder = fs.readdirSync(mode+"/");
	for (let i=0; i<imgFolder.length; i++){
		img.push(mode+"/"+imgFolder[i]);
	}
	jsonImages["images"] = img;
	return jsonImages;
}

/**
 * Reads the file for the month, and returns a JSON obecjt.
 * First line determines which day of the month start, and end date
 * Rest of file contains the date and name
 */
function getSchedule(mode){
	let jsonSchedule = {};
	let determine = [];
	let dateName = [];
	let month = fs.readFileSync(mode+"/2019/May.txt", "utf8").split("\n");

	//first line of file determines start day and end date.
	let firstLine = month[0].split(",");
	let startDate = {};
	startDate["startday"] = firstLine[0];
	startDate["enddate"] = firstLine[1];
	determine.push(startDate);

	for(let i = 1; i < month.length - 1; i++){
		let line = month[i].split(",");		
		let info = {};
		info["date"] = line[0];
		info["name"] = line[1];
		dateName.push(info);
	}
	jsonSchedule["startend"] = determine;
	jsonSchedule["whenwho"] = dateName;
	return jsonSchedule;
}

app.listen(process.env.PORT);
//app.listen(3000);
