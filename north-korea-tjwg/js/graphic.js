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
        pymChild = new parseym.Child({});
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

    // Create container
    var chartElement = containerElement.append('svg')
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .append('g')
        .attr('transform', 'translate(' + margins['left'] + ')');

    // 2015 population
    var color = d3.scale.threshold()
    .domain([150, 2500, 7500, 15000, 25000, 53000])
    .range(["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"]);

var projection = d3.geo.patterson()
        .center([127.9661242,40.2555065])
        .scale([chartWidth * 5])
        .translate([chartWidth / 1.9, chartHeight / 2.1]);

var path = d3.geo.path()
    .projection(projection);

queue()
    .defer(d3.json, "data/north-korea-counties.json")
    .defer(d3.json, "data/north-korea-provinces.json")
    // .defer(d3.json, "data/north-korea-water.json")
    // .defer(d3.json, "data/nkneighbors.json")
    .await(ready);

function ready(error, nkcounty, nkprovince, asia) {
  if (error) throw error;


  // Create tooltip

    var tooltip = d3.select(config['container']).append('div')
        .attr('class', 'hidden tooltip');

    var tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        return "<strong>County: </strong>" + d.properties.NAME_1;
      })

    chartElement.call(tooltip)
        tooltip.direction('e');

 // counties

   // chartElement.append("g")
   //  .selectAll("path")
   //      .data(topojson.feature(nkcounty, nkcounty.objects.PRK_adm2).features)
   //  .enter().append("path")
   //      .attr("d", path)
   //      .on('mouseover', tooltip.show)
   //      .on('mouseout', tooltip.hide)
   //      .attr("class", function(d, i) {
   //          return 'municipalities ' + classify(d.properties.NAME_2);
   //          });

// provinces

   chartElement.append("g")
    .selectAll("path")
        .data(topojson.feature(nkprovince, nkprovince.objects.provincesclean).features)
    .enter().append("path")
        .attr("d", path)
        .on('mouseover', tooltip.show)
        .on('mouseout', tooltip.hide)
        .attr("class", function(d, i) {
            return 'provinces ' + classify(d.properties.NAME_1);
            });

// province labels

    // chartElement.selectAll("text")
    // .attr("class", "province-labels")
    //     .data(topojson.feature(nkprovince, nkprovince.objects.provinces).features)
    // .enter().append("text")
    //   .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
    //   .attr("dy", "1")
    //   .text(function(d) { return d.properties.NAME_1; })
    //   .attr('class', function(d, i) {
    //             return 'province-labels ' + classify(d.properties.NAME_1);
    //         });

}
}

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
