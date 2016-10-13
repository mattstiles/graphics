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
    .domain([0.02, 0.04, 0.06, 0.08, 0.10])
    .range(["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"]);

var projection = d3.geo.albersUsa()
        .scale([chartWidth * 1.4])
        .translate([chartWidth / 2, chartHeight / 2]);

var path = d3.geo.path()
    .projection(projection);

queue()
    .defer(d3.json, "js/us.json")
    .defer(d3.tsv, "data/unemployment.tsv", function(d) {
          return { 
        id: d.id,
        rate: +d.rate
         };
    })
    .await(ready);

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
      .style("fill", function(d) { return color(rateById[d.id]); })
      .on('mousemove', function(d) {
            var mouse = d3.mouse(chartElement.node()).map(function(d) {
                return parseInt(d);
            });
            tooltip.classed('hidden', false)
                .attr('style', 'left:' + (mouse[0] + 10) +
                        'px; top:' + (mouse[1] - 10) + 'px')
                .html(function() {
                    return "<strong>FIPS: </strong>" + [d.id] + "<br><strong>Rate: </strong>" + Math.abs([rateById[d.id]] * 100).toLocaleString(2) + "%"});
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
