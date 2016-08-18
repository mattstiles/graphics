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
        d['alc_both_rate_year'] = +d['alc_both_rate_year'];
        d['both_smoke'] = +d['both_smoke'];
		d['alc_grms_both'] = +d['alc_grms_both'];
		d['muslim_maj'] = +d['muslim_maj'];
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
    //alcohol
	var xColumn = 'alc_both_rate_year';
    //smoking
	var yColumn = 'both_smoke';
	
    var xwomenColumn = 'alc_female_rate_year';
    var ywomenColumn = 'female_smoke';
    var xmenColumn = 'alc_female_rate_year';
    var ymenColumn = 'male_smoke';
	var alcoholGrams = 'alc_grms_both';
	var alcoholwomenGrams = 'alc_grms_women';
	var muslimMaj = 'muslim_maj';

    var barHeight = 1;
    var barGap = 1;
    var labelWidth = 60;
    var labelMargin = 10;
    var valueMinWidth = 30;
    var dotRadius = 5;
	var avgAlcohol = 22.83; 
	var avgSmoking = 44.61;
	var avgwomenAlcohol = 38.48; 
	var avgwomenSmoking = 11.76;

    var margins = {
        top: 20,
        right: 20,
        bottom: 50,
        left: (labelWidth + labelMargin)
    };
	
    var aspectWidth = 16;
    var aspectHeight = 9;

    var ticksX = 6;
    var ticksY = 6;
    var roundTicksFactor = 10;

    if (isMobile) {
        ticksX = 4;
		ticksY = 4;
        margins['right'] = 20;
    }

    // Calculate actual chart dimensions
    var chartWidth = config['width'] - margins['left'] - margins['right'];
    // var chartHeight = (config['data'].length);
	var chartHeight = Math.ceil((config['width'] * aspectHeight) / aspectWidth) - margins['top'] - margins['bottom'];

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
    var xmin = 0;
    var xmax = d3.max(config['data'], function(d) {
        return Math.ceil(d[xwomenColumn] / roundTicksFactor) * roundTicksFactor;
    });

    var xScale = d3.scale.linear()
        .domain([xmin, xmax])
        .range([0, chartWidth]);
		
    var ymin = 0;
    var ymax = d3.max(config['data'], function(d) {
        return Math.ceil(d[ywomenColumn] / roundTicksFactor) * roundTicksFactor;
    });
		
    var yScale = d3.scale.linear()
        .domain([ymin, ymax])
        .range([chartHeight,0]);

    /*
     * Create D3 axes.
     */
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(ticksX)
        .tickFormat(function(d) {
            return d + '%';
        });
		
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .ticks(ticksY)
        .tickFormat(function(d) {
            return d + '%';
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
	    .attr('x', xScale(50))
	    .attr('y', chartHeight + 35)
	    .text('% Drinkers');
		
		var axisLabelX = -50;
		var axisLabelY = chartHeight / 2;

	chartElement.append('g')
	    .attr('class', 'ylabel')
	    .attr('transform', 'translate(' + axisLabelX + ', ' + axisLabelY + ')')
	    .append('text')
	    .attr('text-anchor', 'middle')
	    .attr('transform', 'rotate(-90)')
	    .text('% Smokers')

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
     * Render average lines
     */
	
    chartElement.append('line')
        .attr('class', 'avg-line-drinking')
        .attr('x1', xScale(avgwomenAlcohol))
        .attr('x2', xScale(avgwomenAlcohol))
        .attr('y1', chartHeight)
        .attr('y2', 0)
			
    chartElement.append('line')
        .attr('class', 'avg-line-smoking')
        .attr('x1', chartWidth)
        .attr('x2', 0)
        .attr('y1', yScale(avgwomenSmoking))
        .attr('y2', yScale(avgwomenSmoking))
	
	// Render scatterplot "more/less" annotations 
			
     var annotations = chartElement.append('g')
        .attr('class', 'annotations');
			
    annotations.append('text')
        .attr('class', 'label-alcohol')
        .attr('x', xScale(avgwomenAlcohol)+ 5)
        .attr('dx', 0)
        .attr('text-anchor', 'top')
        .attr('y', yScale(55))
        .html(LABELS['annotations_alcohol'])

    annotations.append('text')
        .attr('class', 'label-smoking')
        .attr('x', xScale(4))
        .attr('dx', 20)
        .attr('text-anchor', 'top')
        .attr('y', yScale(12.5))
        .html(LABELS['annotations_smoking'])
	
	/*
     * Render circles to chart.
     */
    chartElement.append('g')
        .attr('class', 'dots')
        .selectAll('circle')
        .data(config['data'])
        .enter().append('circle')
            .attr('cx', function(d, i) {
                return xScale(d[xwomenColumn]);
            })
            .attr('cy', function(d, i) {
                return yScale(d[ywomenColumn]);
            })			
			.attr("r", function(d) {
			    return Math.sqrt(d[alcoholGrams]*1);
			})
			// Highlight muslim countries
            .attr('class', function(d) {
                return 'dots-' + (d['muslim_maj']).toString();
            })
			// Silly tooltip
			.on('mouseover', function(d) {
		          tooltip.transition()
		               .duration(500)
		               .style('opacity', 1);
		          tooltip.html(d['label'])
		               .style('left', (d3.event.pageX + 2) + 'px')
		               .style('top', (d3.event.pageY - 16) + 'px');
		      })
		      .on('mouseout', function(d) {
		          tooltip.transition()
		               .duration(500)
		               .style('opacity', 0);
		      });
			
    /*
     * Render labels to circles.
     */
	chartElement.append('g')
		.attr('class', 'labels')
		.selectAll('text')
        .data(config['data'])
		.enter().append('text')
			.text(function(d) {
				return d['label'];
			})
			.attr('x', function(d) {
				return xScale(d[xwomenColumn]);
			})
			.attr('y', function(d) {
				return yScale(d[ywomenColumn]);
			})
            .attr('class', function(d) {
                return classify(d['label']).toString();
            });
			
	// Render tooltip
	var tooltip = d3.select("body").append("div")
	    .attr("class", "tooltip")
	    .style("opacity", 1);
}

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
