function worksNavigator() {



}

worksNavigator.prototype.draw = function(thumbnails_panel, nbCol, site_data, selectedCategories, topOnly, newest_first) {


	//TODO Faire traduction des filtres du navigateur de travaux

	var panelWidth = thumbnails_panel.offsetWidth;
	//	console.log("height:" + windowHeight + ", width:" + windowWidth);
	var margin = 10;
	var hoverSize = 2;
	var colHeights = [];
	var colWidth = Math.round(panelWidth / nbCol);
	var colWidthArray = [];
	var elementsArray = [];



	var totalWidth = 0;
	for (let i = 0; i < nbCol; i++) {
		colHeights[i] = 0;
		colWidthArray[i] = colWidth;
		totalWidth = totalWidth + colWidth;

	}
	colWidthArray[nbCol - 1] = colWidthArray[nbCol - 1] + (panelWidth - totalWidth);

	for (let i = 0; i < nbCol; i++) {

		elementsArray[i] = {};
		elementsArray[i].width = colWidthArray[i];
		elementsArray[i].works = [];

	}
	var stopLoop = false;
	var index = 0;
	if (newest_first === true) {
		index = site_data.works.length - 1;
	}
	while (stopLoop === false) {

		var work = site_data.works[index];
		var active = work.active;
		var workHeight = work.height;
		var workwidth = work.width;
		var category = work.category;
		var isTop = work.level == 5;
		var ratio = workHeight / workwidth;
		workHeight = colWidth * ratio;

		var selected = false;

		if (active === true) {

			if (topOnly === true) {
				if (isTop === true) {
					selected = true;
				}
			} else {
				selected = true;
			}

			if (selected === true) {
				selected = false;
				if (selectedCategories.length > 0) {
					if (selectedCategories.includes(category)) {
						selected = true;
					}
				}
			}

		}

		if (selected === true) {


			var min = Math.min.apply(Math, colHeights);

			var selectedCol = colHeights.indexOf(min);

			//On créé dans la bonne colonne		

			elementsArray[selectedCol].works.push(work);
			work.top_pos = colHeights[selectedCol];
			//On ajoute la hauteur
			colHeights[selectedCol] = colHeights[selectedCol] + margin + workHeight;

		}

		if (newest_first === true) {
			index--;
			if (index < 0) {
				stopLoop = true;
			}
		} else {
			index++;
			if (index >= site_data.works.length) {
				stopLoop = true;
			}
		}
	}


	var html = "<table><tr>";

	for (let i = 0; i < elementsArray.length; i++) {
		var elem = elementsArray[i];
		var width = elem.width;
		
		html = html + "<td><div style='width:" + width + "px;'>";

		for (let j = 0; j < elem.works.length; j++) {

			var work = elem.works[j];
			var workId = work.id;
			var top_pos = work.top_pos;
			var src = lq_image_path + "/" + workId + ".jpg"

			html = html + "<div style='margin-bottom:" + margin + "px;width:" + width + "px;'><img onclick='openWork(\"" + workId + "\")' class='workImg lazy' top_pos='" + top_pos + "' data-src='" + src + "' style='cursor:pointer;width:" + (width - margin - hoverSize) + "px;height:auto;'></div>";

		}

		html = html + "</div></td>";

	}

	html = html + "</tr></table>";
	thumbnails_panel.innerHTML = html;

}



