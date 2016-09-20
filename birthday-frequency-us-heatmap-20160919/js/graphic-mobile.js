// Global vars
var pymChild = null;
var isMobile = false;

/*
 * Initialize the graphic.
 */
var onWindowLoaded = function() {
	if (Modernizr.svg) {
		pymChild = new pym.Child({
		renderCallback: render
		});
	} else {
		pymChild = new pym.Child({});
	}
}



/*
 * Render the graphic.
 */
var render = function(containerWidth) {
	if (!containerWidth) {
		containerWidth = DEFAULT_WIDTH;
	}

	if (containerWidth <= MOBILE_THRESHOLD) {
		isMobile = true;
	} else {
		isMobile = false;
	}
	
	renderGraphic({
		container: '#graphic-mobile',
		width: containerWidth,
		data: DATA
	});

	// Update iframe
	if (pymChild) {
		pymChild.sendHeight();
	}
}

/*
 * Render a graphic.
 */
var renderGraphic = function(config) {
	var aspectWidth = 9;
	var aspectHeight = 16;

	var margins = {
		top: 20,
		right: 10,
		bottom: 20,
		left: 20
	};

    // Calculate actual chart dimensions
    var chartWidth = config['width'] - margins['left'] - margins['right'];
    var chartHeight = 650;
	
	gridSize = Math.ceil(chartHeight / 31),
	buckets = 9,
	colors = ['#efedf5','#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#54278f','#3f007d'], 
	days = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'],
	months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
	datasets = ['assets/data.csv'];	
	

// Clear existing graphic (for redraw)
	var containerElement = d3.select(config['container']);
		containerElement.html('');
		

// Create container
	var chartElement = containerElement.append('svg')
		.attr('width', chartWidth + margins['left'] + margins['right'])
		.attr('height', chartHeight + margins['top'] + margins['bottom'])
		.append('g')
		.attr('transform', 'translate(' + margins['left'] + ',' + margins['top'] + ')');

// Render d3 axis labels
	var monthLabels = chartElement.selectAll('.monthLabel')
		.data(months)
		.enter().append('text')
		.text(function (d) { return d; })
		.attr('x', function (d, i) { return i * gridSize; + 100 })
		.attr('y', -25 )
		.attr('class', 'monthlabel')
		.style('text-anchor', 'middle')
		.attr('transform', 'translate(10,' + gridSize / 1 + ')')

	var dayLabels = chartElement.selectAll('.dayLabel')
		.data(days)
		.enter().append('text')
		.text(function(d) { return d; })
		.attr('x', -20)
		.attr('y', function(d, i) { return i * gridSize + 15; })
		.attr('class', 'daylabel')
		.style('text-anchor', 'end')
		.attr('transform', 'translate(' + gridSize / 1.5 + ')' )
	
	
	var heatmapChart = function(csvFile) {
		d3.csv('assets/data.csv',
		function(d) {
		  return {
		month: +d.month,
		day: +d.day,
		value: +d.value,
		rank: +d.rank,
		birthdate: d.birthdate,
		rank_label: d.rank_label,
		conception_date: d.conception_date
		  };
		},
		function(error, data) {
			 
		// jenks optimized buckets
		var colorScale = d3.scale.threshold()
			.domain([9000, 10250, 10750, 11000, 11250, 11500, 12000, 12250, 12500])
			.range(['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026']);

		var dates = chartElement.selectAll('.day')
			.data(data, function(d) {return d.month+':'+d.day;});

		dates.enter().append('rect')
			.attr('class', function(d) {
				return 'date';
			})
			.attr('x', function(d) { return (d.month - 1) * gridSize; })
			.attr('y', function(d) { return (d.day - 1) * gridSize; })
			.attr('rx', 0)
			.attr('ry', 0)
			.attr('width', gridSize)
			.attr('height', gridSize)			
			.style('fill', function(d) { 
				return colorScale(d.value); 
			});
		});
		};

		heatmapChart(datasets[0]);
	  
		var datasetpicker = d3.select('#dataset-picker').selectAll('.dataset-button')
		.data(datasets);

		datasetpicker.enter()
		.append('input')
		.attr('value', function(d){ return 'Dataset ' + d })
		.attr('type', 'button')
		.attr('class', 'dataset-button')
		.on('click', function(d) {
	
		heatmapChart(d);
		});
	  
}

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
