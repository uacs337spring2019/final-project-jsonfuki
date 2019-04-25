(function(){

	"use strict";

	let slideIndx = 0; //slide show images
	let timerSlide = null; //slideshow timer
	let timerDates = null; //calendar timer
	let datePointer = ""; //reference to which date was clicked


	window.onload = function(){
		callAjax(createSlideShow, "slideshow", "get"); //slideshow

		//visibility
		document.getElementById("alloptions").style.display = "none";
		document.getElementById("headermid").style.display = "none";

		//events
		document.getElementById("header").onclick = logoClick; 
		document.getElementById("aboutme").onclick = aboutmeClick;
		document.getElementById("gallery").onclick = galleryClick;	
		document.getElementById("appointments").onclick = appointmentsClick;
		document.getElementById("events").onclick = eventsClick;	
	};

	/**
	 * A fetch for a POST & GET request, depending on parameter.
	 * Mode is dependent on the onclick eventaboutme,gallery,appointment,events
	 * @param {function} param calls function
	 * @param {query} mode used for query
	 * @param {string} type folder/files
	 */
	function callAjax(param, mode, type){
		let url = "https://kosmotattoo.herokuapp.com";
		//let url = "http://localhost:3000";
		
		if(type === "get"){
			url = url+"/?mode="+mode; //heroku
			//url = url+"?mode="+mode; //testing
			fetch(url)
				.then(checkStatus)
				.then(function(responseText){
					param(responseText); //calls function
				})
				.catch(function(error){
					console.log(error);
				});
		}else if(type === "post"){
			fetch(url, mode) //fetchOptions
				.then(checkStatus)
				.then(function(responseText){
				console.log(responseText);
					document.getElementById("appname").style.visibility = "hidden";
					let successDiv = document.getElementById("success");
					successDiv.style.display = "block";
					successDiv.innerHTML = "Appointment was a "+responseText+"!";
					timerDates = setInterval(runTimer, 5000); //refresh page after success
				})
				.catch(function(error){
					console.log(error);
				});
		}
	}

	/**
	 * If the response is valid, then returns to callAjax.
	 * Outputs an error if not a 200-300 status
	 * @param {int} response Checks to see if valid
	 * @returns {promise} error message
	 */
	function checkStatus(response){
		if (response.status >= 200 && response.status < 300){
			return response.text();
		} else if(response.status === 404){
			return Promise.reject(new Error("Something went wrong"));
		}else{
			return Promise.reject(new Error(response.status+":"+response.statusText));
		}
	}


	/**
	 * Injects information taken from JSON object, aboutme.txt
	 * @param {object} responseText JSON object
	 */
	function createAboutme(responseText){
		document.getElementById("headermid").innerHTML = "About Me";
		document.getElementById("aboutmebox").innerHTML = "";

		showElement("optionsabout"); //shows aboutme context and hides rest

		let aboutMeDiv = document.getElementById("aboutmebox");
		let aboutMe = JSON.parse(responseText);
		let paraElem = document.createElement("p");
		paraElem.className = "aboutmeinfo";
		paraElem.innerHTML = aboutMe;
		aboutMeDiv.appendChild(paraElem);
	}


	/**
	 * Creates image elements and injects it in the page from JSON object.
	 * @param {object} responseText JSON object
	 */
	function createGallery(responseText){
		document.getElementById("headermid").innerHTML = "Gallery";
		document.getElementById("gallerybox").innerHTML = "";

		showElement("optionsgallery"); //shows gallery contents and hides rest
		
		let galleryDiv = document.getElementById("gallerybox");
		let images = JSON.parse(responseText);

		for (let i =0; i<images["images"].length; i++){
			let eachImg = document.createElement("img");
			eachImg.className = "eachimage";
			eachImg.src = images["images"][i]; 
			//eachImg.onclick = enlargeImg;
			galleryDiv.appendChild(eachImg);
		}
	}

	/**
	 * Uses JSON object to create a calendar with the corresponding month
	 * Creates tds to keep track if an appointment can be set
	 * @param {object} responseText JSON object
	 */
	function createAppointments(responseText){
		document.getElementById("headermid").innerHTML = "Appointments";
		document.getElementById("appname").style.visibility = "hidden";
		document.getElementById("success").style.display = "none";
		showElement("optionsapp"); //shows and hides needed elements
		
		let schedule = JSON.parse(responseText);
		let datesList = getDates(schedule);
		
		let num = 1;
		let startGrid = 3; //month starts
		let endGrid = 33; //month ends
		for(let i = 0; i < 35; i++){ //35(7x5) to create calendar grid
			let eachTD = document.createElement("td");
			if(i >= startGrid && i <= endGrid){
				eachTD.innerHTML = num;
				eachTD.className = "eachtd";
				eachTD.onclick = dateClick;
				num++;
			}
			addRowCol(i, eachTD); //adds tds to specific trs
		}
		datesAvailable(datesList);
	}


	/**
	 * Sets a calendar date to be valid or invalid
	 * Used as a reference to set appointment
	 * @param {array} datesList Strings of dates from file
	 */
	function datesAvailable(datesList){
		let calendarDates = document.querySelectorAll(".eachtd");
		for(let i = 0; i < calendarDates.length; i++){
			calendarDates[i].validDate = null; //initially
			for(let j = 0; j < datesList.length; j++){
				if(calendarDates[i].innerHTML === datesList[j]){
					calendarDates[i].style.color = "firebrick";
					calendarDates[i].validDate = false;
				}else if(calendarDates[i].validDate === null){ //if determined
					calendarDates[i].validDate = true;
				}
			}
		}	
	}


	/**
	 * Displays an input text box if a blox is not booked.
	 * Uses POST when button is clicked
	 */
	function dateClick(){
		clearInterval(timerDates); //stops interval for user input
		document.getElementById("success").style.display = "none";
		if (this.validDate){
			document.getElementById("appname").style.visibility = "visible";
			document.getElementById("first").onclick = clearBox;
			document.getElementById("last").onclick = clearBox;
			datePointer = this.innerHTML;
			document.getElementById("send").onclick = submitApp;

		}else{
			document.getElementById("appname").style.visibility = "hidden";
		}
	}

	/**
	 * POST request to append names and dates in a file
	 */
	function submitApp(){
		let firstName = document.getElementById("first").value;
		let lastName = document.getElementById("last").value;
		let month = "May";
		let mode = "appointments";
		let date = datePointer;
		document.getElementById("first").value = "";
		document.getElementById("last").value = "";
		const message = {
			date: date,
			firstname: firstName,
			lastname: lastName,
			month: month,
			mode: mode
			};
		const fetchOptions = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(message)
		};
		callAjax(success, fetchOptions, "post");
		document.getElementById("first").value = "First Name";
		document.getElementById("last").value = "Last Name";
	}


	/**
	 * Displays a successful appointment booking
	 * @param {object} responseText JSON object
	 */
// 	function success(responseText){
// 		document.getElementById("appname").style.visibility = "hidden";
// 		let successDiv = document.getElementById("success");
// 		successDiv.style.display = "block";
// 		successDiv.innerHTML = "Appointment was a "+responseText+"!";
// 		timerDates = setInterval(runTimer, 5000); //refresh page after success
// 	}

	/**
	 * Returns a list string integers of dates from appointment file. 
	 * @param {object} schedule JSON object
	 * @returns {array} Array of strings
	 */
	function getDates(schedule){
		let datesList = [];
		for(let i = 0; i <schedule["whenwho"].length; i++){
			datesList.push(schedule["whenwho"][i]["date"]);
		}
		return datesList;
	}

	/**
	 * Adds 7 td elements in a tr to replicate a calendar
	 * @param {int} i loop iteration
	 * @param {element} eachTD table cell
	 */
	function addRowCol(i, eachTD){
		let row1 = document.getElementById("row1");
		let row2 = document.getElementById("row2");
		let row3 = document.getElementById("row3");
		let row4 = document.getElementById("row4");
		let row5 = document.getElementById("row5");
		if(i < 7){
			row1.appendChild(eachTD);
		}else if(i >= 7 && i <= 13){
			row2.appendChild(eachTD);
		}else if(i >= 14 && i <= 20){
			row3.appendChild(eachTD);
		}else if(i >= 21 && i <= 27){
			row4.appendChild(eachTD);
		}else if(i >= 26 && i <= 34){
			row5.appendChild(eachTD);
		}
	}


	/**
	 * Uses ajax to get a JSON obeject with all the images from the file.
	 * Creates div and img elements for each image and injects it to the DOM.
	 * Calls a function to show the slides
	 * @param {object} responseText JSON object
	 */
	function createSlideShow(responseText){
		let jsonSlide = JSON.parse(responseText);
		for (let i=0; i < jsonSlide["images"].length; i++){
			let slideDiv = document.createElement("div");
			let slideImg = document.createElement("img");

			slideImg.className = "eachslide";
			slideImg.src = jsonSlide["images"][i];
			slideDiv.appendChild(slideImg);
			document.getElementById("slideshow").appendChild(slideDiv);
		}
		showSlides();
	}


	/**
	 * Sets a timer to display all the images to create a slideshow effect.
	 */
	function showSlides(){
		let slides = document.getElementsByClassName("eachslide");
			for (let i=0; i < slides.length; i++){
				slides[i].style.display = "none";
			}
			slideIndx++;
			if (slideIndx > slides.length){
				slideIndx = 1;
			}
			slides[slideIndx-1].style.display = "block";
			timerSlide = setTimeout(showSlides, 2500); //2.5 seconds
	}


	/**
	 * Shows a specific element and hides the rest
	 * Stops the timer for the slideshow
	 * @param {div} element div from html
	 */
	function showElement(element){
		clearTimeout(timerSlide);
		clearInterval(timerDates);
		document.getElementById("alloptions").style.display = "block";
		document.getElementById("headermid").style.display = "block";
		let options = document.querySelectorAll(".optionsmid");
		for(let i=0; i<options.length; i++){
			if(options[i].id === element){
				document.getElementById(options[i].id).style.display = "block";
			}else {
				document.getElementById(options[i].id).style.display = "none";
				document.getElementById("slideshow").style.display = "none";
			}
		}
	}


	/**
	 * Fetches data from server.
	 */
	function aboutmeClick(){
		callAjax(createAboutme, "aboutme", "get");
	}

	/**
	 * Fetches data from server.
	 * @Params: function, query, reqeust
	 */
	function galleryClick(){
		callAjax(createGallery, "gallery", "get");
	}


	/**
	 * Fetches and creates an interval to refresh the calendar bookings
	 */
	function appointmentsClick(){
		callAjax(createAppointments, "appointments", "get");
		timerDates = setInterval(runTimer, 5000); //five seconds
	}

	/**
	 * Creates interval and fetches every five seconds 
	 */
	function runTimer(){
		callAjax(createAppointments, "appointments", "get");
	}

	/**
	 * function under construction
	 */
	function eventsClick(){
		document.getElementById("headermid").innerHTML = "Under Construction";

		showElement("optionsmid"); //shows gallery contents and hides rest
	}

	/**
	 * Simualtes onload when the user clicks the top header
	 */
	function logoClick(){
		callAjax(createSlideShow, "slideshow", "get"); //slideshow
		document.getElementById("slideshow").style.display = "block";
		document.getElementById("alloptions").style.display = "none";
		document.getElementById("headermid").style.display = "none";
	}

	/**
	 * Clears text when user inputs name
	 */
	function clearBox(){
		this.value = "";
	}

})();
