(function(){

	"use strict";

	window.onload = function(){
		//visibility
		document.getElementById("alloptions").style.visibility = "hidden";
		document.getElementById("headerbot").style.visibility = "hidden";

		//events
		document.getElementById("aboutme").onclick = aboutmeClick;
		document.getElementById("gallery").onclick = galleryClick;		


	};

	/**
	 * A fetch for a POST & GET request, depending on parameter.
	 * Mode is dependent on the onclick event(aboutme,gallery,appointment,events)
	 */
	function callAjax(funct, mode, type){
		let url = "http://localhost:3000?mode="+mode;
		fetch(url)
			.then(checkStatus)
			.then(function(responseText){
				funct(responseText);
			})
			.catch(function(error){
				console.log(error);
			});
	}

	/**
	 * If the response is valid, then returns to callAjax.
	 * Outputs an error if not a 200-300 status
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
	 * Shows a specific element and hides the rest
	 */
	function showElement(element){
		let options = document.querySelectorAll(".optionsbot");
		console.log(options);
		for(let i=0; i<options.length; i++){
			if(options[i].id === element){
				options[i].hidden = false;
			}else {
				options[i].hidden = true;
				options[i].innerHTML = "";
			}
		}
	}


	/**
	 * Fetches data from server.
	 * @Params: function, query, reqeust
	 */
	function aboutmeClick(){
		callAjax(aboutMe, "aboutme", "get");
	}

	/**
	 * Injects information taken from the file, aboutme.txt
	 */
	function aboutMe(responseText){
		document.getElementById("alloptions").style.visibility = "visible";
		document.getElementById("headerbot").style.visibility = "visible";
		document.getElementById("headerbot").innerHTML = "About Me";

		showElement("optionsabout"); //shows aboutme context and hides rest

		let optionsAboutDiv = document.getElementById("optionsabout");
		let aboutMe = JSON.parse(responseText);
		let paraElem = document.createElement("p");
		paraElem.className = "aboutmeinfo";
		paraElem.innerHTML = aboutMe;
		optionsAboutDiv.appendChild(paraElem);
	}

	/**
	 * Fetches data from server.
	 * @Params: function, query, reqeust
	 */
	function galleryClick(){
		callAjax(gallery, "gallery", "get");
	}

	/**
	 *
	 */
	function gallery(responseText){
		document.getElementById("alloptions").style.visibility = "visible";
		document.getElementById("headerbot").style.visibility = "visible";
		document.getElementById("headerbot").innerHTML = "Gallery";

		showElement("optionsgallery"); //shows gallery contents and hides rest

		let galleryDiv = document.getElementById("optionsgallery");
		let images = JSON.parse(responseText);

		for (let i =0; i<images["images"].length; i++){
			let eachImg = document.createElement("img");
			eachImg.className = "eachimage";
			eachImg.src = images["images"][i]; 
			galleryDiv.appendChild(eachImg);
		}
	}

})();