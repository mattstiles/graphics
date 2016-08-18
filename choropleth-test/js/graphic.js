// Global vars
var pymChild = null;
var isMobile = false;
var GEO_DATA_URL = 'us.json';
var geoData = null;


/*
 * Initialize the graphic.
 */
var onWindowLoaded = function() {
    if (Modernizr.svg) {
        loadJSON()
    } else {
        pymChild = new pym.Child({});

        pymChild.onMessage('scroll-depth', function(data) {
            data = JSON.parse(data);
            
        });
    }
}

/*
 * Load graphic data from a CSV.
 */
var loadJSON = function() {
    d3.json(GEO_DATA_URL, function(error, data) {
        geoData = data;

        pymChild = new pym.Child({
            renderCallback: render
        });

        pymChild.onMessage('on-screen', function(bucket) {
            ANALYTICS.trackEvent('on-screen', bucket);
        });
        pymChild.onMessage('scroll-depth', function(data) {
            data = JSON.parse(data);
            ANALYTICS.trackEvent('scroll-depth', data.percent, data.seconds);
        });
    });
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

	if (containerWidth > MOBILE_THRESHOLD && containerWidth <= MID_DESKTOP_THRESHOLD) {
        isMidDesktop = true;
    } else {
        isMidDesktop = false;
    }

    renderGraphic({
        container: '#graphic',
        width: containerWidth,
        data: null
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
    var aspectHeight = 3;
	
    var path = null;

    var margins = {
        top: 0,
        right: 15,
        bottom: 20,
        left: 15
    };

    // Calculate actual chart dimensions
    var chartWidth = config['width'] - margins['left'] - margins['right'];
    var chartHeight = Math.ceil((config['width'] * aspectHeight) / aspectWidth) - margins['top'] - margins['bottom'];

    // Clear existing graphic (for redraw)
    var containerElement = d3.select(config['container']);
    containerElement.html('');	
	
    /*
     * Create the root SVG element.
     */
    var chartWrapper = containerElement.append('div')
        .attr('class', 'graphic-wrapper');

    var chartElement = containerElement.append('svg')
        .attr('width', chartWidth + margins['left'] + margins['right'])
        .attr('height', chartHeight + margins['top'] + margins['bottom'])
        .append('g')
        .attr('transform', 'translate(' + margins['left'] + ',' + margins['top'] + ')');
		
	queue()
	    .defer(d3.tsv, "unemployment.tsv")
	    .await(ready);

    // D3 scale
		
	var color = d3.scale.threshold()
	    .domain([0.02, 0.04, 0.06, 0.08, 0.10])
	    .range(["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"]);

	var path = d3.geo.path();
	
	function ready(error, us, unemployment) {
	  if (error) throw error;

	  var rateById = {};

	  unemployment.forEach(function(d) { rateById[d.id] = +d.rate; });

	  chartElement.append("g")
	      .attr("class", "counties")
	    .selectAll("path")
	      .data(topojson.feature(us, us.objects.counties).features)
	    .enter().append("path")
	      .attr("d", path)
	      .style("fill", function(d) { return color(rateById[d.id]); });

	  chartElement.append("path")
	      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a.id !== b.id; }))
	      .attr("class", "states")
	      .attr("d", path);
	}
	
	
	
	
	
}

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
