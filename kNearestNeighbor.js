// tree vs shrub vs vine using height and "trunk" diameter
var point = function(object) {
	for(var key in object) {
		this[key] = object[key];
	}
};

var point_list = function(k) {
	this.points = [];
	this.k = k;
};

// helper function for pushing to points ds 
point_list.prototype.add = function(point) {
    this.points.push(point);
};

// get the range of min and max for each dimension so graph can be scaled
point_list.prototype.calcMinMax = function() {
	this.heights = {min: 9999999, max: 0};
	this.stem_diameters = {min: 9999999, max: 0};

	for(var i in this.points) {
		// get min stem_diameter
		if(this.points[i].stem_diameter < this.stem_diameters.min) {
			this.stem_diameters.min = this.points[i].stem_diameter;
		}
		// get max stem_diameter
		if(this.points[i].stem_diameter > this.stem_diameters.max) {
			this.stem_diameters.max = this.points[i].stem_diameter;
		}
		// get min height
		if(this.points[i].height < this.heights.min) {
			this.heights.min = this.points[i].height;
		}
		// get max height
		if(this.points[i].height > this.heights.max) {
			this.heights.max = this.points[i].height;
		}
	}
};

point_list.prototype.determineType = function(guess_index) {
	this.calcMinMax();

	this.points[guess_index].neighbors = [];
	for(var i in this.points) {
		if(!this.points[i].type) {
			continue;
		}
		this.points[guess_index].neighbors.push(new point(this.points[i]));
	}

	// measure distances
	this.points[guess_index].calcDistances(this.stem_diameters, this.heights);

	// sort by distance
	this.points[guess_index].sortDistances();

	//console.log("This plant is a " + points.points[guess_index].guessType(this.k));

	// output
	var output = document.getElementById("output");
	output.innerHTML = points.points[guess_index].guessType(this.k);
};

// calculate the distances between this point and every other point
point.prototype.calcDistances = function(stem_diameters_object, heights_object) {
	var stem_range = stem_diameters_object.max - stem_diameters_object.min;
	var height_range = heights_object.max - heights_object.min;

	for(var i in this.neighbors) {
		var neighbor = this.neighbors[i];

		var delta_stem = neighbor.stem_diameter - this.stem_diameter;
		delta_stem = delta_stem/stem_range;

		var delta_height = neighbor.height - this.height;
		delta_height = delta_height/height_range;

		neighbor.distance = Math.sqrt(delta_stem*delta_stem + delta_height * delta_height);
	}
};

// sort 
point.prototype.sortDistances = function() {
	this.neighbors.sort(function(a, b) {
		return a.distance - b.distance;
	});
};

point.prototype.guessType = function(k) {
	var types = {};

	// slice k min neighbors
	for(var i in this.neighbors.slice(0, k)) {
		var neighbor = this.neighbors[i];

		if(!types[neighbor.type]) {
			types[neighbor.type] = 0;
		}

		types[neighbor.type] += 1;
	}

	// set guess equal to max count value of types
	var guess = {type: false, count: 0};
	for(var type in types) {
		if(types[type] > guess.count) {
			guess.type = type;
			guess.count = types[type];
		}
	}

	this.guess = guess;

	return guess.type;
}

point_list.prototype.draw = function(canvas_id) {
    var stem_range = this.stem_diameters.max - this.stem_diameters.min;
    var height_range = this.heights.max - this.heights.min;

    var canvas = document.getElementById(canvas_id);
    var canvas_draw = canvas.getContext("2d");
    var width = 400;
    var height = 400;
    canvas_draw.clearRect(0,0,width, height);

    for (var i in this.points)
    {
        canvas_draw.save();

        if(this.points[i].type == 'shrub') {
            canvas_draw.fillStyle = '#f85c37';
        } else if(this.points[i].type == 'tree') {
            canvas_draw.fillStyle = '#1ABC9C';
        } else if(this.points[i].type == 'vine') {
            canvas_draw.fillStyle = '#2C3E50';
        } else {
            canvas_draw.fillStyle = '#666666';
        }

        var padding = 40;
        var x_padding = (width  - padding) / width;
        var y_padding = (height - padding) / height;

        var x = (this.points[i].stem_diameter - this.stem_diameters.min) * (width  / stem_range) * x_padding + (padding / 2);
        var y = (this.points[i].height  - this.heights.min) * (height / height_range) * y_padding + (padding / 2);
        y = Math.abs(y - height);

        canvas_draw.translate(x, y);
        canvas_draw.beginPath();
        canvas_draw.arc(0, 0, 5, 0, Math.PI*2, true);
        canvas_draw.fill();
        canvas_draw.closePath();

        var output = document.getElementById("output");

        if ( ! this.points[i].type )
        {

        	if(this.points[i].guess.type == 'shrub') {
                output.style.color = '#f85c37';
                canvas_draw.strokeStyle = '#f85c37';
	        } else if(this.points[i].guess.type == 'tree') {
                output.style.color = '#1ABC9C';
                canvas_draw.strokeStyle = '#1ABC9C';
	        } else if(this.points[i].guess.type == 'vine') {
               	output.style.color = '#2C3E50';
                canvas_draw.strokeStyle = '#2C3E50';
	        } else {
                canvas_draw.strokeStyle = '#666666';
	        }

            var rad = this.points[i].neighbors[this.k - 1].distance * width;
            rad *= x_padding;
            canvas_draw.beginPath();
            canvas_draw.arc(0, 0, rad, 0, Math.PI*2, true);
            canvas_draw.stroke();
            canvas_draw.closePath();
        }
        canvas_draw.restore();
    }
};

var points;

var input = [
    {stem_diameter: 8, height: 11, type: 'shrub'},
    {stem_diameter: 18, height: 6, type: 'shrub'},
    {stem_diameter: 6, height: 12, type: 'shrub'},
    {stem_diameter: 20, height: 13, type: 'shrub'},
    {stem_diameter: 12, height: 15, type: 'shrub'},
    {stem_diameter: 19, height: 10, type: 'shrub'},
    {stem_diameter: 8, height: 12, type: 'shrub'},
    {stem_diameter: 21, height: 14, type: 'shrub'},
    {stem_diameter: 9, height: 9, type: 'shrub'},
    {stem_diameter: 17, height: 8, type: 'shrub'},

    {stem_diameter: 25,  height: 87,  type: 'tree'},
    {stem_diameter: 13,  height: 83,  type: 'tree'},
    {stem_diameter: 25,  height: 41, type: 'tree'},
    {stem_diameter: 45,  height: 52, type: 'tree'},
    {stem_diameter: 23,  height: 41, type: 'tree'},
    {stem_diameter: 44,  height: 78, type: 'tree'},
    {stem_diameter: 28, height: 38, type: 'tree'},
    {stem_diameter: 31,  height: 40, type: 'tree'},
    {stem_diameter: 16,  height: 70, type: 'tree'},
    {stem_diameter: 28,  height: 100, type: 'tree'},

    {stem_diameter: 3, height: 82,  type: 'vine'},
    {stem_diameter: 1, height: 48,  type: 'vine'},
    {stem_diameter: 3, height: 25,  type: 'vine'},
    {stem_diameter: 2, height: 72,  type: 'vine'},
    {stem_diameter: 4, height: 28, type: 'vine'},
    {stem_diameter: 3, height: 38, type: 'vine'},
    {stem_diameter: 2, height: 70, type: 'vine'},
    {stem_diameter: 1, height: 44, type: 'vine'},
    {stem_diameter: 1, height: 33, type: 'vine'},
    {stem_diameter: 2, height: 104, type: 'vine'},
    {stem_diameter: 3, height: 77, type: 'vine'},
];

var run = function() {
	// number of arguments in point_list constructor is k
	points = new point_list(5);
	for(var i in input) {
		points.add(new point(input[i]));
	}
	var random_stem = 0;
	var random_height = 0;

	// randomizes small or large stem
	if(Math.random() > 0.5) {
		random_stem = Math.round(Math.random() * 50)/2 + 10;
	} else {
		random_stem = Math.round(Math.random() * 12)/2 + 0.5;
	}

	// randomizes small or large height
	if(Math.random() > 0.5) {
		random_height = Math.round(Math.random() * 54) + 50;
	} else {
		random_height = Math.round(Math.random() * 15) + 6;
	}

	var random = document.getElementById("random");
	random.innerHTML = "Random stem diameter: " + random_stem + " inches and random height: " + random_height + " feet";

	points.add(new point({stem_diameter: random_stem, height: random_height, type: false}));

	points.determineType(input.length);

	points.draw("myCanvas");
};

setInterval(run, 5000);
run();