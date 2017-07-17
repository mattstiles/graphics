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
        .center([126.9780, 37.5665])
        .scale([chartWidth * 90])
        .translate([chartWidth / 2, chartHeight / 2]);

var path = d3.geo.path()
    .projection(projection);

queue()
    .defer(d3.json, "data/2013/json/skorea_municipalities_topo-seoul.json")
    .defer(d3.json, "data/2013/json/skorea_provinces_topo-seoul.json")
    
    // 2015 foreigner population
    // .defer(d3.tsv, "data/foreigners.txt")
    
    // 2015 population
    .defer(d3.tsv, "data/foreigners.txt")
    .await(ready);

function ready(error, korea, provinces, koreans) {
  if (error) throw error;

  var popById = {};
  var placeName = {};

  koreans.forEach(function(d) { 
    
    placeName[d.id] = d.place,
    popById[d.id] = +d.population;

    });

 // Create tooltip

    var tooltip = d3.select(config['container']).append('div')
        .attr('class', 'hidden tooltip');

    var tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        return "<strong>Place: </strong>" + placeName[d.properties.id] + "<br><strong>2015 Foreigners: </strong>" + [popById[d.properties.id]].toLocaleString(0);
      })

    chartElement.call(tooltip)
        tooltip.direction('e');

 // municipalities (251 polygons: gu, gun, si)

   chartElement.append("g")
    .selectAll("path")
        .data(topojson.feature(korea, korea.objects.skorea_municipalities_geo).features)
    .enter().append("path")
        .attr("d", path)
        .style("fill", function(d) { return color(popById[d.properties.id]); })
        .on('mouseover', tooltip.show)
        .on('mouseout', tooltip.hide)
        .attr("class", function(d, i) {
            return 'municipalities ' + classify(placeName[d.properties.id]);
            });

 // provinces (17 polygons: cities, provinces)

 chartElement.append("g")
    .attr("class", "provinces")
    .selectAll(".provinces")
      .data(topojson.feature(provinces, provinces.objects.skorea_provinces_geo).features)
      .enter().append("path")
    .attr("d", path)
    .attr('class', function(d, i) {
                return 'provinces-' + classify(d.properties.name_eng);
            });

// muni labels

    chartElement.selectAll("text")
      .data(topojson.feature(korea, korea.objects.skorea_municipalities_geo).features)
    .enter().append("text")
      .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
      .attr("dy", "1")
      .text(function(d) { return d.properties.name_eng; })
      .attr('class', function(d, i) {
                return 'municipalities-labels ' + classify(d.properties.name_eng);
            });



}
}

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
