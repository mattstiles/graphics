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
    // renderGraphic({
    //     container: '#graphic',
    //     width: containerWidth,
    //     data: []
    // });

    // Update iframe
    if (pymChild) {
        pymChild.sendHeight();
    }
}

/*
 * Render a graphic.
 */
	
	$(function () {
		
		Highcharts.setOptions({
           chart: {
			   style: {
			   	fontFamily: '"Source Sans Pro", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif',
			   }
           }
       });

	var mapData = Highcharts.maps['custom/world-robinson'];

	    var data =
			[{"code":"AF","name":"Afghanistan","value":0.01,"rank":"180"},
		{"code":"FG", "value":0, "name": "French Guiana","rank":"184"},
		{"code":"MN", "value":0, "name": "Mongolia","rank":"184"},
		{"code":"ME", "value":0, "name": "Macedonia","rank":"184"},
		{"code":"KV", "value":0, "name": "Kosovo","rank":"184"},
		{"code":"GL", "value":0, "name": "Greenland","rank":"184"},
		{"code":"SS", "value":0, "name": "South Sudan","rank":"184"},
		{"code":"AL","name":"Albania","value":5.37,"rank":"85"},
		{"code":"DZ","name":"Algeria","value":0.56,"rank":"155"},
		{"code":"AD","name":"Andorra","value":10.57,"rank":"20"},
		{"code":"AO","name":"Angola","value":8.06,"rank":"50"},
		{"code":"AG","name":"Antigua and Barbuda","value":7.84,"rank":"52"},
		{"code":"AR","name":"Argentina","value":8.11,"rank":"49"},
		{"code":"AM","name":"Armenia","value":4.09,"rank":"96"},
		{"code":"AU","name":"Australia","value":10.3,"rank":"23"},
		{"code":"AT","name":"Austria","value":12.04,"rank":"5"},
		{"code":"AZ","name":"Azerbaijan","value":1.98,"rank":"124"},
		{"code":"BS","name":"Bahamas","value":9.34,"rank":"35"},
		{"code":"BH","name":"Bahrain","value":1.66,"rank":"131"},
		{"code":"BD","name":"Bangladesh","value":0.01,"rank":"180"},
		{"code":"BB","name":"Barbados","value":8.51,"rank":"42"},
		{"code":"BY","name":"Belarus","value":17.31,"rank":"1"},
		{"code":"BE","name":"Belgium","value":10.11,"rank":"27"},
		{"code":"BZ","name":"Belize","value":6.64,"rank":"66"},
		{"code":"BJ","name":"Benin","value":1.4,"rank":"137"},
		{"code":"BT","name":"Bhutan","value":0.23,"rank":"168"},
		{"code":"BO","name":"Bolivia","value":3.93,"rank":"100"},
		{"code":"BA","name":"Bosnia and Herzegovina","value":4.64,"rank":"91"},
		{"code":"BW","name":"Botswana","value":5.76,"rank":"78"},
		{"code":"BR","name":"Brazil","value":7.58,"rank":"55"},
		{"code":"BN","name":"Brunei Darussalam","value":0.97,"rank":"145"},
		{"code":"BG","name":"Bulgaria","value":10.67,"rank":"18"},
		{"code":"BF","name":"Burkina Faso","value":4.51,"rank":"92"},
		{"code":"BI","name":"Burundi","value":4.16,"rank":"94"},
		{"code":"CV","name":"Cabo Verde","value":5.07,"rank":"88"},
		{"code":"KH","name":"Cambodia","value":2.12,"rank":"122"},
		{"code":"CM","name":"Cameroon","value":6.19,"rank":"71"},
		{"code":"CA","name":"Canada","value":8.2,"rank":"46"},
		{"code":"CF","name":"Central African Republic","value":1.66,"rank":"131"},
		{"code":"TD","name":"Chad","value":0.56,"rank":"155"},
		{"code":"CL","name":"Chile","value":7.26,"rank":"60"},
		{"code":"CN","name":"China","value":5.63,"rank":"82"},
		{"code":"CO","name":"Colombia","value":4.37,"rank":"93"},
		{"code":"KM","name":"Comoros","value":0.12,"rank":"173"},
		{"code":"CG","name":"Congo","value":3.82,"rank":"101"},
		{"code":"CK","name":"Cook Islands","value":6.36,"rank":"70"},
		{"code":"CR","name":"Costa Rica","value":3.41,"rank":"105"},
		{"code":"CI","name":"Côte d'Ivoire","value":3.13,"rank":"110"},
		{"code":"HR","name":"Croatia","value":12.19,"rank":"4"},
		{"code":"CU","name":"Cuba","value":4.14,"rank":"95"},
		{"code":"CY","name":"Cyprus","value":10.69,"rank":"16"},
		{"code":"CZ","name":"Czech Republic","value":12.43,"rank":"3"},
		{"code":"CD","name":"Democratic Republic of the Congo","value":1.82,"rank":"127"},
		{"code":"DK","name":"Denmark","value":10.47,"rank":"21"},
		{"code":"DJ","name":"Djibouti","value":0.39,"rank":"163"},
		{"code":"DM","name":"Dominica","value":5.46,"rank":"83"},
		{"code":"DO","name":"Dominican Republic","value":5.91,"rank":"76"},
		{"code":"EC","name":"Ecuador","value":3.99,"rank":"98"},
		{"code":"EG","name":"Egypt","value":0.22,"rank":"169"},
		{"code":"SV","name":"El Salvador","value":2.37,"rank":"119"},
		{"code":"GQ","name":"Equatorial Guinea","value":10.99,"rank":"14"},
		{"code":"ER","name":"Eritrea","value":0.62,"rank":"152"},
		{"code":"EE","name":"Estonia","value":11.61,"rank":"9"},
		{"code":"ET","name":"Ethiopia","value":1.32,"rank":"139"},
		{"code":"FI","name":"Finland","value":9.81,"rank":"29"},
		{"code":"FR","name":"France","value":11.8,"rank":"7"},
		{"code":"GA","name":"Gabon","value":8.9,"rank":"39"},
		{"code":"GM","name":"Gambia","value":3.41,"rank":"105"},
		{"code":"GE","name":"Georgia","value":8.14,"rank":"47"},
		{"code":"DE","name":"Germany","value":11.2,"rank":"12"},
		{"code":"GH","name":"Ghana","value":1.64,"rank":"133"},
		{"code":"GR","name":"Greece","value":8.02,"rank":"51"},
		{"code":"GD","name":"Grenada","value":7.84,"rank":"52"},
		{"code":"GT","name":"Guatemala","value":2.16,"rank":"120"},
		{"code":"GN","name":"Guinea","value":0.22,"rank":"169"},
		{"code":"GW","name":"Guinea-Bissau","value":3.57,"rank":"104"},
		{"code":"GY","name":"Guyana","value":7.56,"rank":"56"},
		{"code":"HT","name":"Haiti","value":5.68,"rank":"80"},
		{"code":"HN","name":"Honduras","value":3.1,"rank":"111"},
		{"code":"HU","name":"Hungary","value":11.51,"rank":"10"},
		{"code":"IS","name":"Iceland","value":8.13,"rank":"48"},
		{"code":"IN","name":"India","value":3,"rank":"114"},
		{"code":"ID","name":"Indonesia","value":0.08,"rank":"175"},
		{"code":"IR","name":"Iran","value":0.03,"rank":"178"},
		{"code":"IQ","name":"Iraq","value":0.17,"rank":"171"},
		{"code":"IE","name":"Ireland","value":11.72,"rank":"8"},
		{"code":"IL","name":"Israel","value":2.67,"rank":"116"},
		{"code":"IT","name":"Italy","value":6.98,"rank":"62"},
		{"code":"JM","name":"Jamaica","value":3.58,"rank":"103"},
		{"code":"JP","name":"Japan","value":7.39,"rank":"58"},
		{"code":"JO","name":"Jordan","value":0.43,"rank":"162"},
		{"code":"KZ","name":"Kazakhstan","value":6.63,"rank":"67"},
		{"code":"KE","name":"Kenya","value":1.8,"rank":"128"},
		{"code":"KI","name":"Kiribati","value":0.53,"rank":"159"},
		{"code":"KP","name":"Korea, North","value":3.39,"rank":"107"},
		{"code":"KR","name":"Korea, South","value":9.34,"rank":"35"},
		{"code":"KW","name":"Kuwait","value":0.02,"rank":"179"},
		{"code":"KG","name":"Kyrgyzstan","value":3.28,"rank":"109"},
		{"code":"LA","name":"Laos","value":5.39,"rank":"84"},
		{"code":"LV","name":"Latvia","value":10.14,"rank":"26"},
		{"code":"LB","name":"Lebanon","value":1.57,"rank":"134"},
		{"code":"LS","name":"Lesotho","value":0.61,"rank":"153"},
		{"code":"LR","name":"Liberia","value":0.01,"rank":"180"},
		{"code":"LY","name":"Libya","value":0,"rank":"184"},
		{"code":"LT","name":"Lithuania","value":12.66,"rank":"2"},
		{"code":"LU","name":"Luxembourg","value":11.5,"rank":"11"},
		{"code":"MK","name":"Macedonia","value":1.16,"rank":"142"},
		{"code":"MG","name":"Madagascar","value":0.97,"rank":"145"},
		{"code":"MW","name":"Malawi","value":1.23,"rank":"141"},
		{"code":"MY","name":"Malaysia","value":0.51,"rank":"160"},
		{"code":"MV","name":"Maldives","value":1.92,"rank":"125"},
		{"code":"ML","name":"Mali","value":0.61,"rank":"153"},
		{"code":"MT","name":"Malta","value":6.91,"rank":"63"},
		{"code":"MR","name":"Mauritania","value":0.01,"rank":"180"},
		{"code":"MU","name":"Mauritius","value":3.03,"rank":"112"},
		{"code":"MX","name":"Mexico","value":5.3,"rank":"86"},
		{"code":"FM","name":"Micronesia","value":1.89,"rank":"126"},
		{"code":"MA","name":"Morocco","value":0.54,"rank":"157"},
		{"code":"MZ","name":"Mozambique","value":0.94,"rank":"148"},
		{"code":"MM","name":"Myanmar","value":0.33,"rank":"164"},
		{"code":"NA","name":"Namibia","value":7.84,"rank":"52"},
		{"code":"NP","name":"Nepal","value":0.27,"rank":"167"},
		{"code":"NL","name":"Netherlands","value":8.96,"rank":"38"},
		{"code":"NZ","name":"New Zealand","value":9.47,"rank":"33"},
		{"code":"NI","name":"Nicaragua","value":3.39,"rank":"107"},
		{"code":"NE","name":"Niger","value":0.15,"rank":"172"},
		{"code":"NG","name":"Nigeria","value":8.75,"rank":"40"},
		{"code":"NU","name":"Niue","value":5.99,"rank":"74"},
		{"code":"NO","name":"Norway","value":6.53,"rank":"68"},
		{"code":"OM","name":"Oman","value":0.54,"rank":"157"},
		{"code":"PK","name":"Pakistan","value":0.04,"rank":"176"},
		{"code":"PA","name":"Panama","value":6.9,"rank":"64"},
		{"code":"PG","name":"Papua New Guinea","value":0.88,"rank":"149"},
		{"code":"PY","name":"Paraguay","value":5.79,"rank":"77"},
		{"code":"PE","name":"Peru","value":4.83,"rank":"90"},
		{"code":"PH","name":"Philippines","value":4.96,"rank":"89"},
		{"code":"PL","name":"Poland","value":10.93,"rank":"15"},
		{"code":"PT","name":"Portugal","value":11.92,"rank":"6"},
		{"code":"QA","name":"Qatar","value":1.16,"rank":"142"},
		{"code":"MD","name":"Republic of Moldova","value":9.45,"rank":"34"},
		{"code":"RO","name":"Romania","value":9.1,"rank":"37"},
		{"code":"RU","name":"Russian Federation","value":11.04,"rank":"13"},
		{"code":"RW","name":"Rwanda","value":8.34,"rank":"44"},
		{"code":"KN","name":"Saint Kitts and Nevis","value":8.28,"rank":"45"},
		{"code":"LC","name":"Saint Lucia","value":10.43,"rank":"22"},
		{"code":"VC","name":"Saint Vincent and the Grenadines","value":7.02,"rank":"61"},
		{"code":"WS","name":"Samoa","value":2.15,"rank":"121"},
		{"code":"ST","name":"Sao Tome and Principe","value":5.69,"rank":"79"},
		{"code":"SA","name":"Saudi Arabia","value":0.09,"rank":"174"},
		{"code":"SN","name":"Senegal","value":0.32,"rank":"165"},
		{"code":"RS","name":"Serbia","value":9.56,"rank":"32"},
		{"code":"SC","name":"Seychelles","value":9.72,"rank":"30"},
		{"code":"SL","name":"Sierra Leone","value":3.78,"rank":"102"},
		{"code":"SG","name":"Singapore","value":1.8,"rank":"128"},
		{"code":"SK","name":"Slovakia","value":10.24,"rank":"24"},
		{"code":"SI","name":"Slovenia","value":10.61,"rank":"19"},
		{"code":"SB","name":"Solomon Islands","value":0.99,"rank":"144"},
		{"code":"SO","name":"Somalia","value":0,"rank":"184"},
		{"code":"ZA","name":"South Africa","value":7.38,"rank":"59"},
		{"code":"ES","name":"Spain","value":9.62,"rank":"31"},
		{"code":"LK","name":"Sri Lanka","value":3.03,"rank":"112"},
		{"code":"SD","name":"Sudan","value":2.12,"rank":"122"},
		{"code":"SR","name":"Suriname","value":5.64,"rank":"81"},
		{"code":"SZ","name":"Swaziland","value":5.2,"rank":"87"},
		{"code":"SE","name":"Sweden","value":7.4,"rank":"57"},
		{"code":"CH","name":"Switzerland","value":9.99,"rank":"28"},
		{"code":"SY","name":"Syrian Arab Republic","value":0.76,"rank":"151"},
		{"code":"TJ","name":"Tajikistan","value":0.32,"rank":"165"},
		{"code":"TH","name":"Thailand","value":6.07,"rank":"72"},
		{"code":"TL","name":"Timor-Leste","value":0.5,"rank":"161"},
		{"code":"TG","name":"Togo","value":1.44,"rank":"136"},
		{"code":"TO","name":"Tonga","value":0.96,"rank":"147"},
		{"code":"TT","name":"Trinidad and Tobago","value":6.5,"rank":"69"},
		{"code":"TN","name":"Tunisia","value":1.29,"rank":"140"},
		{"code":"TR","name":"Turkey","value":1.53,"rank":"135"},
		{"code":"TM","name":"Turkmenistan","value":2.55,"rank":"118"},
		{"code":"TV","name":"Tuvalu","value":1.34,"rank":"138"},
		{"code":"UG","name":"Uganda","value":10.22,"rank":"25"},
		{"code":"UA","name":"Ukraine","value":8.48,"rank":"43"},
		{"code":"AE","name":"United Arab Emirates","value":1.73,"rank":"130"},
		{"code":"GB","name":"United Kingdom","value":10.68,"rank":"17"},
		{"code":"TZ","name":"United Republic of Tanzania","value":4.04,"rank":"97"},
		{"code":"US","name":"United States of America","value":8.67,"rank":"41"},
		{"code":"UY","name":"Uruguay","value":5.97,"rank":"75"},
		{"code":"UZ","name":"Uzbekistan","value":2.83,"rank":"115"},
		{"code":"VU","name":"Vanuatu","value":0.85,"rank":"150"},
		{"code":"VE","name":"Venezuela","value":6.74,"rank":"65"},
		{"code":"VN","name":"Viet Nam","value":3.94,"rank":"99"},
		{"code":"YE","name":"Yemen","value":0.04,"rank":"176"},
		{"code":"ZM","name":"Zambia","value":2.57,"rank":"117"},
		{"code":"ZW","name":"Zimbabwe","value":6,"rank":"73"}];
      
        // Initiate the chart
        $('#graphic').highcharts('Map', {
						
			tooltip: {
		    	useHTML: true,
		     		style : { 
						opacity: 1,
					},
				borderWidth: 0,
				borderColor: '#ffffff',
				borderRadius: 0,	
	         },

            title : {
				enabled: false,
                text : ' '
            },
			
			chart: {
	            spacingBottom: 0
	        },
	        title : {
	            text : ''
	        },

	        legend: {
				enabled: false,
				useHTML: true,
				style: {
	                fontFamily: 'Source Sans Pro, Helvetica,Arial,sans-serif'
	            }
	        },
			
			mapNavigation: {
		            enabled: false,
		            enableMouseWheelZoom: false,
	            buttonOptions: {
	                verticalAlign: 'top'
	            } 
			},
			// legend: {
// 				itemStyle: {
// 	                color: '#000000',
// 	                fontWeight: 'normal',
// 					fontSize: 12,
// 					paddingBottom: 4,
// 					backgroundColor: '#FCFFC5',
// 					borderColor: '#ffffff',
//
// 	            },
//
// 	            // title: {
// // 					enabled: false,
// // 	                text: 'Annual Liters Per Capita:'
// // 	            },
// 			    layout: 'horizontal',
// 				itemDistance: 8,
// 	            padding: 5,
// 	            align: 'center',
// 				verticalAlign: 'top',
// 	            floating: false,
// 	            valueDecimals: 0,
// 	            symbolRadius: 0,
// 	            symbolHeight: 10,
// 				symbolWidth: 20,
// 	        },
			credits: {
			      enabled: false
			  },

			colorAxis: {
				
                dataClasses: [{
                    // bg-1
					from: .0001,
                    to: 1,
                    color: '#f2f0f7',
                    name: '< 1 liters/person a year'
                }, {
					// bg-2
                    from: 1.001,
                    to: 3,
                    color: '#dadaeb',
                    name: '1-3'
                }, {
					// bg-3
                    from: 3.001,
                    to: 5,
                    color: '#bcbddc',
                    name: '3-5'
                }, {
					// bg-4
                    from: 5.001,
                    to: 7,
                    color: '#9e9ac8',
                    name: '5-7'
				}, {
					// bg-5
                    from: 7.001,
                    to: 9,
                    color: '#807dba',
                    name: '7-9'
				}, {
					// bg-6
                    from: 9.001,
                    to: 12,
                    color: '#6a51a3',
                    name: '9-12'
				}, {
					// bg-7
                    from: 12.001,
                    to: 18,
                    color: '#4a1486',
					borderWidth: 1,
					borderColor: '#ffffff',
                    name: '> 12'
				}, {
                    from: 0,
                    to: .0001,
                    color: '#ccc',
                    name: 'No Data'
                }]
            },
			
			
			plotOptions: {
				animation: false,
	            map: {
	                allAreas: false,
	                joinBy: ['iso-a2', 'code'],
	                dataLabels: {
	                    enabled: false,
	                },
	                mapData: Highcharts.maps['custom/world-robinson'],
	                tooltip: {
	                    headerFormat: '',
	                    pointFormat: '<b>{point.name}:</b> {point.value}/person a year<br/><b>World Rank:</b> {point.rank}' + ' of 186 countries',
						valueSuffix: ' liters',
						shared: true
					}
	            },

				series: {
					name: 'country',
					animation: false,
	                states: {
	                    hover: {
	                        enabled: true,
							color: '#F7E39B'
	                    }
	                }
	            },
	        },

            series : [{
                data : data,
                mapData: mapData,
                joinBy: ['iso-a2', 'code'],
                name: ' ',
                states: {
                    hover: {
                        color: '#EFC637'
                    }
                },
            }]
        });
});


/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
