// Global vars
var pymChild = null;
var isMobile = false;

/*
 * Initialize the graphic.
 */
var onWindowLoaded = function() {
    if (Modernizr.svg) {
        formatData();

        pymChild = new pym.Child({
            renderCallback: render
        });
    } else {
        pymChild = new pym.Child({});
    }
}

/*
 * Format graphic data for processing by D3.
 */

var formatData = function() {
    DATA.forEach(function(d) {
        d['CountryCode'] = +d['CountryCode'];
        d['AnnualTemp'] = +d['AnnualTemp'];
        d['MeanHeight'] = +d['MeanHeight'];
		d['Country'] = +d['Country'];
		d['Population'] = +d['Population'];
    });
}

/*
 * Render the graphic(s). Called by pym with the container width.
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

    // Render the chart!
    renderDotChart({
        container: '#dot-chart',
        width: containerWidth,
        data: DATA
    });

    // Update iframe
    if (pymChild) {
        pymChild.sendHeight();
    }
}

/*
 * Render a bar chart.
 */
var renderDotChart = function(config) {
    /*
     * Setup
     */
    var labelColumn = 'label';
	var valueColumn = 'Population';
    var yColumn = 'MeanHeight';
    var xColumn = 'AnnualTemp';

    var barHeight = 1;
    var barGap = 1;
    var labelWidth = 60;
    var labelMargin = 10;
    var valueMinWidth = 30;
    var dotRadius = 4;
	//maleHeight
	var avgHeight = 171.01; 
	var avgTemperature = 18.05;
	var Population = 'Population'

    var margins = {
        top: 20,
        right: 20,
        bottom: 50,
        left: (labelWidth + labelMargin)
    };

    var aspectWidth = 16;
    var aspectHeight = 9;

    var ticksX = 10;
    var ticksY = 6;
    var roundTicksFactor = 10;

    if (isMobile) {
        ticksX = 4;
		ticksY = 4;
        margins['right'] = 20;
    }

    // Calculate actual chart dimensions
    var chartWidth = config['width'] - margins['left'] - margins['right'];
    var chartHeight = ((barHeight + barGap) * config['data'].length);

    // Clear existing graphic (for redraw)
    var containerElement = d3.select(config['container']);
    containerElement.html('');

    /*
     * Create the root SVG element.
     */
    var chartWrapper = containerElement.append('div')
        .attr('class', 'graphic-wrapper');

    var chartElement = chartWrapper.append('svg')
        .attr('width', chartWidth + margins['left'] + margins['right'])
        .attr('height', chartHeight + margins['top'] + margins['bottom'])
        .append('g')
        .attr('transform', 'translate(' + margins['left'] + ',' + margins['top'] + ')');

    /*
     * Create D3 scale objects.
     */
	    var xmin = -10;
	    var xmax = 30;

	    var xScale = d3.scale.linear()
	        .domain([xmin, xmax])
	        .range([0, chartWidth]);
		
	    var ymin = 150;
	    var ymax = 190;
		
	    var yScale = d3.scale.linear()
	        .domain([ymin, ymax])
	        .range([chartHeight, 0]);

    /*
     * Create D3 axes.
     */
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(ticksX)
        .tickFormat(function(d) {
            return d + '°C';
        });
		
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .ticks(ticksX)
        .tickFormat(function(d) {
            return d + ' cm';
        });

    /*
     * Render axes to chart.
     */
    chartElement.append('g')
        .attr('class', 'x axis')
        .attr('transform', makeTranslate(0, chartHeight))
        .call(xAxis);
		
    chartElement.append('g')
        .attr('class', 'y axis')
        .call(yAxis);
		
	// Render axes labels
	chartElement.append('text')
	    .attr('class', 'xlabel')
	    .attr('text-anchor', 'middle')
	    .attr('x', xScale(10))
	    .attr('y', chartHeight + 35)
	    .text('Average Annual Temperature');
		
		var axisLabelX = -50;
		var axisLabelY = chartHeight / 2;

	chartElement.append('g')
	    .attr('class', 'ylabel')
	    .attr('transform', 'translate(' + axisLabelX + ', ' + axisLabelY + ')')
	    .append('text')
	    .attr('text-anchor', 'middle')
	    .attr('transform', 'rotate(-90)')
	    .text('Average Male Height')

	// Render grid shading 
			
     var annotations = chartElement.append('g')
        .attr('class', 'annotations');
		
    annotations.append('rect')
        .attr('class', 'taller-hotter')
        .attr('x', xScale(avgTemperature))
        .attr('y', yScale(190))
        .attr('width', xScale(30) - xScale(avgTemperature))
        .attr('height', yScale(171))
		
    annotations.append('rect')
        .attr('class', 'shorter-colder')
        .attr('x', xScale(-10))
        .attr('y', yScale(171))
        .attr('width', xScale(avgTemperature))
        .attr('height', (yScale(150) - yScale(171)))
		
    annotations.append('rect')
        .attr('class', 'taller-colder')
        .attr('x', xScale(-10))
        .attr('y', yScale(190))
        .attr('width', xScale(avgTemperature))
        .attr('height', (yScale(171) - yScale(190)))
		
    annotations.append('rect')
        .attr('class', 'shorter-hotter')
        .attr('x', xScale(avgTemperature))
        .attr('y', yScale(171))
        .attr('width', xScale(30) - xScale(avgTemperature))
        .attr('height', yScale(150) - yScale(171))
    
	/*
     * Render grid to chart.
     */
    var xAxisGrid = function() {
        return xAxis;
    };
	
    chartElement.append('g')
        .attr('class', 'x grid')
        .attr('transform', makeTranslate(0, chartHeight))
        .call(xAxisGrid()
            .tickSize(-chartHeight, 0, 0)
            .tickFormat('')
        );
		
    var yAxisGrid = function() {
        return yAxis;
    };

    chartElement.append('g')
        .attr('class', 'y grid')
        .call(yAxisGrid()
            .tickSize(0-chartWidth)
            .tickFormat('')
        );
    
	
	/*
     * Render average lines/labels
     */
	
    chartElement.append('line')
        .attr('class', 'avg-line-height')
        .attr('x1', xScale(avgTemperature))
        .attr('x2', xScale(avgTemperature))
        .attr('y1', chartHeight)
        .attr('y2', 0)
			
    chartElement.append('line')
        .attr('class', 'avg-line-temperature')
        .attr('x1', chartWidth)
        .attr('x2', 0)
        .attr('y1', yScale(avgHeight))
        .attr('y2', yScale(avgHeight))
		
	chartElement.append('text')
        .attr('class', 'avg-label-height')
        .attr('x', xScale(-9))
        .attr('dx', 0)
        .attr('text-anchor', 'begin')
        .attr('y', yScale(172))
        .html(LABELS['annotation_avg-label-height'])
		
	chartElement.append('text')
        .attr('class', 'avg-label-temperature')
        .attr('x', xScale(17.7))
        .attr('dx', 0)
        .attr('text-anchor', 'end')
        .attr('y', yScale(186))
        .html(LABELS['annotation_avg-label-temperature'])
	
	/*
     * Render circles to chart.
     */
    chartElement.append('g')
        .attr('class', 'dots')
        .selectAll('circle')
        .data(config['data'])
        .enter().append('circle')
            .attr('cx', function(d, i) {
                return xScale(d[xColumn]);
            })
            .attr('cy', function(d, i) {
                return yScale(d[yColumn]);
            })			
			// .attr("r", function(d) {
	// 		    return Math.sqrt(d[Population]/2000000);
	// 		})
			.attr('r', dotRadius)
            .attr('class', function(d) {
                return classify(d['label']).toString() + ' ' + classify(d['Income']).toString();
            })
		// tooltip
		.on('mouseover', function(d) {
	          tooltip.transition()
	               .duration(500)
	               .style('opacity', 1);
			   tooltip.html(d['label'])
	               .style('left', (d3.event.pageX + 4) + 'px')
	               .style('top', (d3.event.pageY - 16) + 'px');
	      })
	      .on('mouseout', function(d) {
	          tooltip.transition()
	               .duration(200)
	               .style('opacity', 0);
	      });
			
	// render annotation labels
		
	chartElement.append('text')
        .attr('class', 'label-colder-shorter')
        .attr('x', xScale(-9))
        .attr('dx', 0)
        .attr('text-anchor', 'begin')
        .attr('y', yScale(152))
        .html(LABELS['annotation_colder-shorter'])
		
    chartElement.append('text')
        .attr('class', 'label-hotter-taller')
        .attr('x', xScale(28))
        .attr('dx', 20)
        .attr('text-anchor', 'end')
        .attr('y', yScale(187.2))
        .html(LABELS['annotation_hotter-taller'])
		
	chartElement.append('text')
        .attr('class', 'label-colder-taller')
        .attr('x', xScale(-9))
        .attr('dx', 0)
        .attr('text-anchor', 'begin')
        .attr('y', yScale(187.2))
        .html(LABELS['annotation_colder-taller'])
		
    chartElement.append('text')
        .attr('class', 'label-hotter-shorter')
        .attr('x', xScale(28))
        .attr('dx', 20)
        .attr('text-anchor', 'end')
        .attr('y', yScale(152))
        .html(LABELS['annotation_hotter-shorter'])
	    
		/*
	     * Render labels to circles.
	     */
		chartElement.append('g')
			.attr('class', 'shadow')
			.selectAll('text')
	        .data(config['data'])
			.enter().append('text')
				.text(function(d) {
					return d['label'];
				})
				.attr('x', function(d) {
					return xScale(d[xColumn]);
				})
				.attr('y', function(d) {
					return yScale(d[yColumn]);
				})
	            .attr('class', function(d) {
	                return classify(d['label']).toString();
	            })
			
		chartElement.append('g')
			.attr('class', 'labels')
			.selectAll('text')
	        .data(config['data'])
			.enter().append('text')
				.text(function(d) {
					return d['label'];
				})
				.attr('x', function(d) {
					return xScale(d[xColumn]);
				})
				.attr('y', function(d) {
					return yScale(d[yColumn]);
				})
	            .attr('class', function(d) {
	                return classify(d['label']).toString();
	            })
			
		// Render tooltip
		var tooltip = d3.select("body").append("div")
		    .attr("class", "tooltip")
		    .style("opacity", .7);
	}
/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
