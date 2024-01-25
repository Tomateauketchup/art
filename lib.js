
var hq_image_path = "img/paintings/hq";
var nq_image_path = "img/paintings/nq";
var lq_image_path = "img/paintings/lq";
var selected_image_path = "img/paintings/selected";

var windowHeight = window.innerHeight;
var windowWidth = window.innerWidth;
var workViewer;

function doResizeWindow() {
	windowHeight = window.innerHeight;
	windowWidth = window.innerWidth;
	var panel_div = document.querySelector('#main_panel');
	if (panel_div) {
		panel_div.style.height = windowHeight + "px";
		panel_div.style.width = windowWidth + "px";
	}

	if (workViewer) {
		workViewer.resize();
	}
}

//TODO traduire les titre des pages

function getAllWorksFilterType() {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	return urlParams.get('tp');
}

function isSketchType() {
	if (getAllWorksFilterType() === "sk") {
		return true;
	}
	return false;
}
function isChineseType() {
	if (getAllWorksFilterType() === "ch") {
		return true;
	}
	return false;
}
function isPaintingsType() {
	if (getAllWorksFilterType() === "pt") {
		return true;
	}
	return false;
}


function getLanguage() {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	var locale = urlParams.get('locale');
	if (!locale || locale === "") {
		locale = "fr_FR";
	}
	return locale;
}

function translate() {
	var locale = getLanguage();
	var elems = document.querySelectorAll('[lng-tag]');

	if (elems) {
		for (var i = 0; i < elems.length; i++) {
			var elem = elems[i];
			var code = elem.getAttribute("lng-tag");
			var text = getMessage(code, locale);
			if (text) {
				elem.innerHTML = text;
			}

		}
	}

	elems = document.querySelectorAll('[lng-href]');

	if (elems) {
		for (var i = 0; i < elems.length; i++) {
			var elem = elems[i];
			var code = elem.getAttribute("lng-href");
			var params = elem.getAttribute("lng-href-param");
			var str = code + "?locale=" + locale;
			if (params) {
				str = str + "&" + params;
			}
			elem.setAttribute("href", str);


		}
	}
}


function getMessage(code, locale) {

	if (locale) {
		if (locale == "fr_FR") {
			return fr_language_messages[code];
		} else {
			return en_language_messages[code];
		}
	}

	return code;

}

function findWorkById(workId) {
	for (let i = 0; i < site_data.works.length; i++) {
		var work = site_data.works[i];
		if (workId === work.id) {
			return work;
		}
	}
}

function openWork(workId) {

	if (workViewer) {
		workViewer.close();
	}
	workViewer = new WorkViewer(workId);
	workViewer.open();


}

//TODO améliorer l'ordonancement de l'affichage des images

function createWorkDetailBox(work,show_zoom_button) {

	if (work) {

		var work_id = work.id;
		var technique = work.technique;
		var support = work.support;
		var height = work.height;
		var width = work.width;
		var heightStr = Math.round(height / 10);
		var widthStr = Math.round(width / 10);

		var div = document.createElement("div");
		div.setAttribute("class", "workDetailBox");

		var div2 = document.createElement("div");
		div.appendChild(div2);
		div2.setAttribute("class", "workBoxTitle");
		div2.innerHTML = work.id;

		div2 = document.createElement("div");
		div.appendChild(div2);
		div2.innerHTML = widthStr + " x " + heightStr + " cm";


		if (technique) {
			div2 = document.createElement("div");
			div.appendChild(div2);
			var txt=""
			if (technique==="wooden_pencil")
			{
				txt="Tech. : wooden pencil"
			}else if (technique==="ballpoint_pen")
			{
				txt="Tech. : ballpoint pen"
			}else if (technique==="oil_painting")
			{
				txt="Tech. : oil painting"
			}else if (technique==="chinese_ink")
			{
				txt="Tech. : chinese ink"
			}else if (technique==="acrylic_painting")
			{
				txt="Tech. : acrylic painting"
			}else if (technique==="watercolor_acrylic")
			{
				txt="Tech. : watercolor, acrylic"
			}
			
			
			div2.innerHTML=txt;
		}
		if (support) {

			div2 = document.createElement("div");
			div.appendChild(div2);
			var txt=""
			if (support==="wood")
			{
				txt="Sup. : wood"
			}else if (support==="canvas")
			{
				txt="Sup. : canvas"
			}else if (support==="chinese_paper")
			{
				txt="Sup. : chinese paper"
			}else if (support==="paper")
			{
				txt="Sup. : paper"
			}else if (support==="cotton_paper_640")
			{
				txt="Sup. : cotton paper 640g/m2"
			}
			div2.innerHTML=txt;
		}
		
		if (show_zoom_button === true)
		{
			var a=document.createElement("div");
			a.style.marginTop="15px"
			a.className="button"
			a.innerHTML="Zoom"
			const workIdConst=work_id
			a.addEventListener("click", function() {
					openWork(workIdConst);
			});
			div.appendChild(a);
		}

		return div;
	}

}

function getPointerXY(e) {
	var x = 0;
	var y = 0;
	if (e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel') {
		var touch = e.touches[0] || e.changedTouches[0];
		x = touch.pageX;
		y = touch.pageY;
	} else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover' || e.type == 'mouseout' || e.type == 'mouseenter' || e.type == 'mouseleave' || e.type == 'wheel') {
		x = e.clientX;
		y = e.clientY;
	}

	var o = {};
	o.x = x;
	o.y = y;
	return o;
}

function WorkViewer(workId) {
	this.workId = workId;
	this.workImg = null;
	this.zoomDiv = null;
	this.windowDiv = null;
	this.scale = 1;
	this.panning = false;
	this.pointX = 0;
	this.pointY = 0;
	this.start = { x: 0, y: 0 };
}

WorkViewer.prototype.changeWork = function(workId) {
	this.workId = workId;
	if (this.workImg) {
		var src = nq_image_path + "/" + work.id + ".jpg";
		this.workImg.src = src;
	}
}
WorkViewer.prototype.setTransform = function() {
	this.zoomDiv.style.transform = "translate(" + this.pointX + "px, " + this.pointY + "px) scale(" + this.scale + ")";
}
WorkViewer.prototype.resize = function() {
	openWork(this.workId);
}
WorkViewer.prototype.close = function() {
	this.windowDiv.remove();
	this.windowDiv = null;
	workViewer = null;
}
WorkViewer.prototype.open = function() {
	var work = findWorkById(this.workId);

	if (work) {


		var src = nq_image_path + "/" + work.id + ".jpg";

		var thisObj = this;
		this.windowDiv = document.createElement("div");
		document.body.appendChild(this.windowDiv);

		this.zoomDiv = document.createElement("table");
		this.windowDiv.appendChild(this.zoomDiv);

		var tr = document.createElement("tr");
		this.zoomDiv.appendChild(tr);

		var td = document.createElement("td");
		tr.appendChild(td);
		td.style.textAlign = "center";
		td.style.verticalAlign = "middle";
		td.style.height = windowHeight + "px";
		td.style.width = windowWidth + "px";

		this.workImg = document.createElement("img");
		td.appendChild(this.workImg);



		var closeButton = document.createElement("div");
		this.windowDiv.appendChild(closeButton);
		closeButton.innerHTML="Close";
		closeButton.setAttribute("class", "closeButton");
		closeButton.style.position = "fixed";
		closeButton.style.top = "0px";
		closeButton.style.right = "0px";
		closeButton.addEventListener("click", function() {
			thisObj.close();
		});

		var infoDiv = document.createElement("div");
		this.windowDiv.appendChild(infoDiv);
		infoDiv.style.position = "fixed";
		infoDiv.style.top = "0px";
		infoDiv.style.left = "0px";
		infoDiv.style.backgroundColor = "#292929";
		infoDiv.style.borderRight = "1px solid #8b8b8b";
		infoDiv.style.borderBottom = "1px solid #8b8b8b";

		var detailsDiv = createWorkDetailBox(work,false);
		infoDiv.appendChild(detailsDiv);

		this.windowDiv.setAttribute("id", "workWindow");
		this.windowDiv.style.height = windowHeight + "px";
		this.windowDiv.style.width = windowWidth + "px";
		this.windowDiv.style.position = "fixed";
		this.windowDiv.style.top = "0px";
		this.windowDiv.style.backgroundColor = "#292929";

		this.zoomDiv.style.height = windowHeight + "px";
		this.zoomDiv.style.width = windowWidth + "px";
		this.zoomDiv.style.transformOrigin = "0px 0px";
		this.zoomDiv.style.transform = "scale(1) translate(0px, 0px)";
		this.zoomDiv.style.cursor = "grab";


		this.workImg.src = src;

		//On détect si il faut ajuster sur la hauteur ou la largeur
		var workRatio = work.width / work.height;
		var screenRatio = windowWidth / windowHeight;

		if (workRatio > screenRatio) {
			this.workImg.style.width = "100%";
			this.workImg.style.height = "auto";
		} else {
			this.workImg.style.height = "100%";
			this.workImg.style.width = "auto";
		}


		this.zoomDiv.onmousedown = function(e) {
			e.preventDefault();

			var o = getPointerXY(e);

			thisObj.start = { x: o.x - thisObj.pointX, y: o.y - thisObj.pointY };
			thisObj.panning = true;
		}

		this.zoomDiv.onmouseup = function(e) {
			thisObj.panning = false;
		}

		this.zoomDiv.onmousemove = function(e) {
			e.preventDefault();
			if (!thisObj.panning) {
				return;
			}

			var o = getPointerXY(e);

			thisObj.pointX = (o.x - thisObj.start.x);
			thisObj.pointY = (o.y - thisObj.start.y);
			thisObj.setTransform();
		}

		this.zoomDiv.onwheel = function(e) {
			e.preventDefault();

			var o = getPointerXY(e);

			var xs = (o.x - thisObj.pointX) / thisObj.scale,
				ys = (o.y - thisObj.pointY) / thisObj.scale,
				delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
			(delta > 0) ? (thisObj.scale *= 1.2) : (thisObj.scale /= 1.2);
			thisObj.pointX = o.x - xs * thisObj.scale;
			thisObj.pointY = o.y - ys * thisObj.scale;

			thisObj.setTransform();
		}

		this.zoomDiv.ontouchstart = this.zoomDiv.onmousedown;
		this.zoomDiv.ontouchend = this.zoomDiv.onmouseup;
		this.zoomDiv.ontouchmove = this.zoomDiv.onmousemove;
		//translate();
	}
}