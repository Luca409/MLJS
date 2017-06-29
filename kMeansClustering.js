var canvas; 
var shape;
var height = 400;
var width = 400;

var means = [];
var clusters = [];
var points_extrema;
var bounds_range;
var delay = 1500;

// data
var points = [  
    [5, 6],
    [23, 17],
    [12, 5], 
    [11, 13],
    [4, 12],
    [29, 10],

    [5, 79],
    [15, 57],
    [3, 56],
    [25, 63],
    [8, 45],
    [12, 70],

    [49, 80],
    [42, 85],
    [41, 90],
    [63, 95],
    [60, 83],
    [65, 93],

    [70, 15],
    [75, 25],
    [80, 13],
    [95, 17],
    [83, 8],
    [93, 12],

    [60, 56],
    [65, 42],
    [70, 47],
    [85, 65],
    [90, 50],
    [77, 64],
];

// get the bounds for the graph that will be displayed later
function graphBounder(extrema) {

	var bounds = [];

	for(var i in extrema) {
		bounds[i] = extrema[i].max - extrema[i].min;
	}

	return bounds;
};


// calculate min and max values for graphBounder function
function calcExtrema(inputs) {

	var extrema = [];

	for(var i in points) {
		var input = points[i];

		for(var j in input) {
			if(!extrema[j]) {
				extrema[j] = {min: 9999999, max: -1};
			}

			if(input[j] < extrema[j].min) {
				extrema[j].min = input[j];
			}

			if(input[j] > extrema[j].max) {
				extrema[j].max = input[j];
			}
		}
	}

	return extrema;
};

// create random points for means clustering; k is the number of clusters you expect to have
function createRandomPoints(k) {
	while(k > 0) {
		var mean = [];

		for(var i in points_extrema) {
			mean[i] = points_extrema[i].min + (Math.random() * bounds_range[i]);
		}

		means.push(mean);

		k -= 1;
	}

	return means;
};

// assigns each point a cluster
function assignCluster() {
	for(var i in points) {
		var input = points[i];
		var distances = [];

		for(var j in means) {
			var mean = means[j];
			var total = 0;

			for(var k in input) {
				var diff = input[k] - mean[k];
				diff *= diff;
				total += diff;
			}
			distances[j] = Math.sqrt(total);
		}
		clusters[i] = distances.indexOf(Math.min.apply(null, distances));
	}
}

function clusterify() {
	assignCluster();

	var sums = Array(means.length);
	var nums = Array(means.length);
	var changed_position = false;

	// initialize all values to zero
	for(var i in means) {
		sums[i] = Array(means[i].length);
		for(var j in means[i]) {
			sums[i][j] = 0;
		}
		nums[i] = 0;
	}	

	// fill values
	for(var i in clusters) {
		var meandex = clusters[i];
		var input = points[i];
		var mean = means[meandex];

		nums[meandex] += 1;

		for(var j in mean) {
			sums[meandex][j] += input[j];
		}
	}

	for(var i in sums) {
		console.log(nums[i]);

		if(nums[i] == 0) {
			sums[i] = means[i];
			console.log("Mean with no points");
			console.log(sums[i]);

			for(var j in points_extrema) {
				sums[i][j] = points_extrema[j].min + (Math.random() * bounds_range[j]);
			}
			continue;
		}
		for(var j in sums[i]) {
			sums[i][j] /= nums[i];
		}
	}

	if(means.toString() != sums.toString()) {
		moved = true;
	}

	means = sums;

	return moved;
}

function display() {

    shape.clearRect(0,0,width, height);

    // display points
    for (var i in points) {
        shape.save();

        var point = points[i];

        var x = (point[0] - points_extrema[0].min + 1) * (width / (bounds_range[0] + 2) );
        var y = (point[1] - points_extrema[1].min + 1) * (height / (bounds_range[1] + 2) );

        shape.fillStyle = '#2C3E50';
        shape.translate(x, y);
        shape.beginPath();
        shape.arc(0, 0, 5, 0, Math.PI*2, true);
        shape.fill();
        shape.closePath();

        shape.restore();
    }

    // display means
    for (var i in means) {
        shape.save();

        var point = means[i];

        var x = (point[0] - points_extrema[0].min + 1) * (width / (bounds_range[0] + 2) );
        var y = (point[1] - points_extrema[1].min + 1) * (height / (bounds_range[1] + 2) );

        shape.fillStyle = '#f85c37';
        shape.translate(x, y);
        shape.beginPath();
        shape.arc(0, 0, 5, 0, Math.PI*2, true);
        shape.fill();
        shape.closePath();

        shape.restore();
    }

    // display lines
    shape.globalAlpha = 0.3;
    for (var point_index in clusters) {
        var mean_index = clusters[point_index];
        var point = points[point_index];
        var mean = means[mean_index];

        shape.save();

        shape.strokeStyle = '#f85c37';
        shape.beginPath();
        shape.moveTo(
            (point[0] - points_extrema[0].min + 1) * (width / (bounds_range[0] + 2) ),
            (point[1] - points_extrema[1].min + 1) * (height / (bounds_range[1] + 2) )
        );
        shape.lineTo(
            (mean[0] - points_extrema[0].min + 1) * (width / (bounds_range[0] + 2) ),
            (mean[1] - points_extrema[1].min + 1) * (height / (bounds_range[1] + 2) )
        );
        shape.stroke();
        shape.closePath();
    
        shape.restore();
    }
    shape.globalAlpha = 1;
}

function run() {
	var something_moved = clusterify();
	display();

	if(something_moved) {
		setTimeout(run, delay);
	}
}

function driver() {
	canvas = document.getElementById("myCanvas");
    shape = canvas.getContext('2d');

    points_extrema = calcExtrema(points);
	bounds_range = graphBounder(points_extrema);
	means = createRandomPoints(5);

	assignCluster();
	display();

	setTimeout(run, delay);
}

driver();