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
    .domain([20, 50, 60, 70, 93])
    .range(["#D3EAF7", "#7DBFE6", "#51AADE", "#3D7FA6", "#28556F"]);

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
                .text('400k');
        }
    });

var projection = d3.geo.mercator()
        .center([128, 35.9])
        .scale([chartWidth * 5.2])
        .translate([chartWidth / 2, chartHeight / 2]);

var path = d3.geo.path()
    .projection(projection);

queue()
    .defer(d3.json, "data/json/election2012.json")
    .defer(d3.json, "data/json/election2012provinces.json")
    
    // 2015 population
    .defer(d3.tsv, "data/foreigners.txt")
    .await(ready);

function ready(error, president, provinces) {
  if (error) throw error;

  var popById = {};
  var placeName = {};

 // Create tooltip

    var tooltip = d3.select(config['container']).append('div')
        .attr('class', 'hidden tooltip');

    var tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        return "<strong>Place: </strong>" + [d.properties.name_eng] +  ", " + [d.properties.province] + "<br><strong>Votes: </strong>" + [d.properties.votes].toLocaleString(0) + "<br><strong>Moon Vote Share: </strong>" + [d.properties.moonjaeinp].toLocaleString(0) + "%";
      })

    chartElement.call(tooltip)
        tooltip.direction('e');

 // municipalities (251 polygons: gu, gun, si)

   chartElement.append("g")
    .selectAll("path")
        .data(topojson.feature(president, president.objects.election2012).features)
    .enter().append("path")
        .attr("d", path)
        .style("fill", function(d) { return color([d.properties.moonjaeinp]); })
        .on('mouseover', tooltip.show)
        .on('mouseout', tooltip.hide)
        .attr("class", function(d, i) {
            return 'municipalities ' + classify(d.properties.name_eng);
            });

 // provinces (17 polygons: cities, provinces)

 chartElement.append("g")
    .attr("class", "provinces")
    .selectAll(".provinces")
      .data(topojson.feature(provinces, provinces.objects.election2012provinces).features)
      .enter().append("path")
    .attr("d", path)
    .attr('class', function(d, i) {
                return 'provinces ' + classify(d.properties.province);
            });

    
// province labels

    chartElement.selectAll("text")
    .attr("class", "province-labels")
      .data(topojson.feature(provinces, provinces.objects.election2012provinces).features)
    .enter().append("text")
      .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
      .attr("dy", "1")
      .text(function(d) { return d.properties.province; })
      .attr('class', function(d, i) {
                return 'province-labels ' + classify(d.properties.province);
            });

}
}

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
