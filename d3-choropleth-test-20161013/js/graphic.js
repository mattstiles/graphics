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

    pymChild.onMessage('on-screen', function(bucket) {
        ANALYTICS.trackEvent('on-screen', bucket);
    });
    pymChild.onMessage('scroll-depth', function(data) {
        data = JSON.parse(data);
        ANALYTICS.trackEvent('scroll-depth', data.percent, data.seconds);
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

    // Render the chart!
    renderGraphic({
        container: '#graphic',
        width: containerWidth,
        data: []
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
    var aspectHeight = 2.5;

    var margins = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };

    // Calculate actual chart dimensions
    var chartWidth = config['width'] - margins['left'] - margins['right'];
    var chartHeight = Math.ceil((config['width'] * aspectHeight) / aspectWidth) - margins['top'] - margins['bottom'];

    // Clear existing graphic (for redraw)
    var containerElement = d3.select(config['container']);
    containerElement.html('');

    //Create tooltip
    var tooltip = d3.select(config['container']).append('div')
        .attr('class', 'hidden tooltip');

    // Create container
    var chartElement = containerElement.append('svg')
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .append('g')
        .attr('transform', 'translate(' + margins['left'] + ')');

    var color = d3.scale.threshold()
    .domain([0.05, 0.1, 0.15, 0.25, 0.5])
    .range(["#C5DFDF", "#8BC0BF", "#51A09E", "#17807E", "#11605E", "#0B403F"]);

// Create legend
    var legendElement = containerElement.select('.key');

    _.each(color.domain(), function(key, i) {
        var keyItem = legendElement.append('li')
            .classed('key-item', true)

        keyItem.append('b')
            .style('background', color(key));

        keyItem.append('label')
            .text(key);

        if (i === color.domain().length - 1) {
            keyItem.append('label')
                .attr('class', 'end-label')
                .text('22%');
        }
    });

var projection = d3.geo.albersUsa()
        .scale([chartWidth * 1.4])
        .translate([chartWidth / 2, chartHeight / 2]);

var path = d3.geo.path()
    .projection(projection);

queue()
    .defer(d3.json, "js/us.json")
    .defer(d3.tsv, "data/americans.tsv")
    .await(ready);

function ready(error, us, americans) {
  if (error) throw error;

  var rateById = {};
  var placeName = {};

  americans.forEach(function(d) { 
    
    rateById[d.id] = +d.rate,
    placeName[d.id] = d.place;

    });

  chartElement.append("g")
      .attr("class", "counties")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
      .attr("d", path)
      .style("fill", function(d) { return color(rateById[d.id]); })
      .on('mousemove', function(d) {
            var mouse = d3.mouse(chartElement.node()).map(function(d) {
                return parseInt(d);
            });
            tooltip.classed('hidden', false)
                .attr('style', 'left:' + (mouse[0] + 10) +
                        'px; top:' + (mouse[1] - 10) + 'px')
                .html(function() {
                    return "<strong>" + Math.abs([rateById[d.id]] * 100).toLocaleString(2) + "%</strong> of people in " + placeName[d.id] + ", cited 'American' ancestry."});
                })
        .on('mouseout', function() {
            tooltip.classed('hidden', true);
        });

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
