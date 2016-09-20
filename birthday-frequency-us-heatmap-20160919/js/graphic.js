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
		container: '#graphic',
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
	var aspectWidth = 4;
	var aspectHeight = 1.7;

	var margins = {
		top: 20,
		right: 20,
		bottom: 20,
		left: 35
	};

	// Calculate actual chart dimensions
	var chartWidth = config['width'] - margins['left'] - margins['right'];
	var chartHeight = Math.ceil((config['width'] * aspectHeight) / aspectWidth) - margins['top'] - margins['bottom'];
	
	gridSize = Math.floor(chartWidth / 31),
	buckets = 9,
	legendElementWidth = gridSize,
	colors = ['#fee8c8','#fdd49e','#fdbb84','#fc8d59','#ef6548','#d7301f','#b30000','#7f0000'], 
	days = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'],
	months = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
	datasets = ['assets/data.csv'];	
	

// Clear existing graphic (for redraw)
	var containerElement = d3.select(config['container']);
		containerElement.html('');
		
// Create tooltip content
	var tip = d3.tip()
	    .attr('class', 'd3-tip')
	    .offset([-10, 0])
	    .html(function(d) {
	      return "This date, <strong>" + d.month + "/" + d.day + "</strong>, had <strong>" + d.value.toLocaleString() + "</strong> births on average. It ranks <strong>" + d.rank_label + " </strong>. The conception date* is around <strong>" + d.conception_date + "</strong>.";
	    })

// Create container
	var chartElement = containerElement.append('svg')
		.attr('width', chartWidth + margins['left'] + margins['right'])
		.attr('height', chartHeight + margins['top'] + margins['bottom'])
		.append('g')
		.attr('transform', 'translate(' + margins['left'] + ',' + margins['top'] + ')');

// Call tooltip
	chartElement.call(tip);

// Render d3 axis labels
	var monthLabels = chartElement.selectAll('.monthLabel')
		.data(months)
		.enter().append('text')
		.text(function (d) { return d; })
		.attr('x', 0)
		.attr('y', function (d, i) { return i * gridSize; })
		.attr('class', 'monthlabel')
		.style('text-anchor', 'end')
		.attr('transform', 'translate(-6,' + gridSize / 1.5 + ')')

	var dayLabels = chartElement.selectAll('.dayLabel')
		.data(days)
		.enter().append('text')
		.text(function(d) { return d; })
		.attr('x', function(d, i) { return i * gridSize; })
		.attr('y', -5)
		.attr('class', 'daylabel')
		.style('text-anchor', 'middle')
		.attr('transform', 'translate(' + gridSize / 2 + ')' )
	
	
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
			.domain([9000, 10500, 10750, 11000, 11250, 11500, 11750, 12000, 12500])
			.range(['#fff7f3','#fde0dd','#fcc5c0','#fa9fb5','#f768a1','#dd3497','#ae017e','#7a0177','#49006a']);
			
// // .RdPu
// 	.range(['#fff7f3','#fde0dd','#fcc5c0','#fa9fb5','#f768a1','#dd3497','#ae017e','#7a0177','#49006a']);
// 	// reds
// 	.range(['#fff5f0','#fee0d2','#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#a50f15','#67000d']);
// 	// oranges
// 	.range(['#fff5eb','#fee6ce','#fdd0a2','#fdae6b','#fd8d3c','#f16913','#d94801','#a63603','#7f2704']);
// 	// greens
// 	.range(['#f7fcf5','#e5f5e0','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#006d2c','#00441b']);
// 	// YloRed
// 	.range(['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026']);
// 	// YlGnBu
// 	.range(['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58']);
// 	// BuPu
// 	.range(['#f7fcfd','#e0ecf4','#bfd3e6','#9ebcda','#8c96c6','#8c6bb1','#88419d','#810f7c','#4d004b']);
			
			
			
			
			

		var dates = chartElement.selectAll('.day')
			.data(data, function(d) {return d.month+':'+d.day;});

		dates.enter().append('rect')
			.attr('class', function(d) {
				return 'date';
			})
			.attr('x', function(d) { return (d.day - 1) * gridSize; })
			.attr('y', function(d) { return (d.month - 1) * gridSize; })
			.attr('rx', 0)
			.attr('ry', 0)
			.attr('width', gridSize)
			.attr('height', gridSize)
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide)			
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
