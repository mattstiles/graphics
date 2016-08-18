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
        d['xdata-all'] = +d['xdata-all'];
        d['ydata-all'] = +d['ydata-all'];
		d['grams'] = +d['grams'];
		d['muslim'] = +d['muslim'];
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
    var xColumn = 'xdata-all';
    var yColumn = 'ydata-all';
    var xwomenColumn = 'xdata-women';
    var ywomenColumn = 'ydata-women';
    var xmenColumn = 'xdata-men';
    var ymenColumn = 'ydata-men';
	var alcoholGrams = 'grams';
	var muslimMaj = 'muslim';

    var barHeight = 1;
    var barGap = 1;
    var labelWidth = 60;
    var labelMargin = 10;
    var valueMinWidth = 30;
    var dotRadius = 5;
	var avgAlcohol = 22.83; 
	var avgSmoking = 44.61;

    var margins = {
        top: 10,
        right: 20,
        bottom: 20,
        left: (labelWidth + labelMargin)
    };
	
    var aspectWidth = 16;
    var aspectHeight = 9;

    var ticksX = 5;
    var ticksY = 5;
    var roundTicksFactor = 10;

    if (isMobile) {
        ticksX = 6;
        margins['right'] = 30;
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
        return Math.ceil(d[xColumn] / roundTicksFactor) * roundTicksFactor;
    });

    var xScale = d3.scale.linear()
        .domain([xmin, xmax])
        .range([0, chartWidth]);
		
    var ymin = 0;
    var ymax = d3.max(config['data'], function(d) {
        return Math.ceil(d[yColumn] / roundTicksFactor) * roundTicksFactor;
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
			.attr("r", function(d) {
			    return Math.sqrt((d[alcoholGrams])*1);
			})
  		  // Highlight muslim countries
            .attr('class', function(d) {
                return 'dots-' + (d['muslim']).toString();
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
				return xScale(d[xColumn]);
			})
			.attr('y', function(d) {
				return yScale(d[yColumn]);
			})
            .attr('class', function(d) {
                return classify(d['label']).toString();
            });
			
    /*
     * Render average lines
     */
	
    chartElement.append('line')
        .attr('class', 'avg-line-smoking')
        .attr('x1', xScale(avgSmoking))
        .attr('x2', xScale(avgSmoking))
        .attr('y1', chartHeight)
        .attr('y2', 0)
			
    chartElement.append('line')
        .attr('class', 'avg-line-drinking')
        .attr('x1', chartWidth)
        .attr('x2', 0)
        .attr('y1', yScale(avgAlcohol))
        .attr('y2', yScale(avgAlcohol))

}

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
