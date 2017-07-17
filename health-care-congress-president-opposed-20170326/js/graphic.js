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

    var color = d3.scale.threshold()
    .domain([40, 50, 60, 70, 81])
    //colorbrewer purples
    // .range(["#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"]);
    //dv orange
    .range(["#F1C696", "#EAAA61", "#E38D2C", "#AA6A21", "#714616"]);

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
        .scale([chartWidth * 1.2])
        .translate([chartWidth / 2, chartHeight / 2]);

var path = d3.geo.path()
    .projection(projection);

queue()
    .defer(d3.json, "js/us.json")
    .defer(d3.json, "js/congress-health.json")
    .defer(d3.tsv, "data/healthcongress.tsv")
    .await(ready);

function ready(error, us, health, healthcongress) {
  if (error) throw error;

    var rateById = {};
    var placeName = {};
    var memberName = {};
    var partyName = {};
    var stateName = {};
    var clintonVote = {};
    var trumpVote = {};
    var districtName = {};
    var billOppose = {};


  healthcongress.forEach(function(d) { 
    
    rateById[d.id] = +d.stronglyoppose,
    billOppose[d.id] = +d.oppose,
    placeName[d.id] = d.place,
    stateName[d.id] = d.state,
    districtName[d.id] = d.district,
    memberName[d.id] = d.incumbent,
    trumpVote[d.id] = +d.trump,
    clintonVote[d.id] = +d.clinton,
    partyName[d.id] = d.party;

    });

  //Create tooltip
    var tooltip = d3.select(config['container']).append('div')
        .attr('class', 'hidden tooltip');

    var tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        return "<strong>Member: </strong>" + memberName[d.properties.id] + "<br><strong>Party-State: </strong> " + partyName[d.properties.id] + "-" + stateName[d.properties.id] + "<br><strong>District: </strong>" + districtName[d.properties.id]  + "<br><strong>Opposed: </strong>" + billOppose[d.properties.id].toLocaleString(0) + "%" + "<br><strong>Trump 2016 Vote: </strong>" + Math.abs([trumpVote[d.properties.id]] ).toLocaleString(0) + "%";
      })

    chartElement.call(tooltip)
        tooltip.direction('n');

  chartElement.append("g")
        .attr("class", "districts")
    .selectAll("path")
        .data(topojson.feature(health, health.objects.congress).features)
    .enter().append("path")
        .attr("d", path)
        .style("fill", function(d) { return color(billOppose[d.properties.id]); })
        .on('mouseover', tooltip.show)
        .on('mouseout', tooltip.hide);

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
