function gotoOverview() {
	window.location.href = "/stats";
}

function getKey() {
	var key = "";
	var parts = window.location.href.split("&");
	for (var i = 0 ; i < parts.length ; i++) {
		var idx = parts[i].search("date_str=");
		if (idx >= 0) {
			key = parts[i].substring(idx + 9, parts[i].length);
		}
	}
	return key;
}

function loadChart() {
	$.getJSON( "/get-daily-liked-posts?session_key="+getCookie("session_key")+"&date_str="+getKey(), function(data) {
		//console.log("got data: "+JSON.stringify(data));
		var xTicks = ['x'];
		var numData_score_total = ['Total score'];
		var numData_threshold = ['Threshold'];
    var numData_min = ['Minimum'];
		var numData_metrics = [];
		var metricsNames = [];
		// first, create metrics arrays
		// metrics
		var metrics = data.posts[0].scoreDetail.metrics;
		for (var i = 1 ; i < data.posts.length ; i++) {
			if (data.posts[i].scoreDetail.metrics.length > metrics.length) {
				metrics = data.posts[i].scoreDetail.metrics;
			}
		}
		for (var j = 0 ; j < metrics.length ; j++) {
			numData_metrics.push([metrics[j].key]);
			metricsNames.push(metrics[j].key);
		}
		for (var i = 0 ; i < data.posts.length ; i++) {
			xTicks.push(data.posts[i].title);
			numData_score_total.push(data.posts[i].score.toFixed(2));
			numData_threshold.push(data.posts[i].thresholdInfo.total.toFixed(2));
      numData_min.push(data.posts[i].thresholdInfo.hasOwnProperty("min") ? data.posts[i].thresholdInfo.min.toFixed(2) : 0);
			// metrics
			metrics = data.posts[i].scoreDetail.metrics;
			for (var j = 0 ; j < metricsNames.length ; j++) {
				var match = false;
				for (var k = 0 ; k < metrics.length ; k++) {
					if (metrics[k].key.localeCompare(metricsNames[j]) == 0) {
						numData_metrics[j].push(metrics[k].score.toFixed(2));
						match = true;
						break;
					}
				}
				if (!match) {
					numData_metrics[j].push(0);
				}
			}
		}
		// combine data to columns for metrics data
		var chart_score_breakdown_columns = [xTicks];
		for (var i = 0 ; i < numData_metrics.length ; i++) {
			chart_score_breakdown_columns.push(numData_metrics[i]);
		}
		var chart_posts = c3.generate({
		    bindto: '#chart_score_summary',
		    size: {
		        height: 600
		    },
		    data: {
		    	x : 'x',
		    	columns: [
		    		xTicks,
		    		numData_score_total,
		    		numData_threshold,
            numData_min
		    	],
		    	type: 'bar',
		    	types: {
		    		Threshold: 'area',
            Minimum: 'area'
		    	},
		    	colors: {
		    		'Total score': '#1f77b4',
		    		Threshold: '#ff7f0e',
						Minimum: '#7f7f7f'
		    	}
		    },
		    bar: {
		    	width: {
		    		ratio: 0.3
		    	}
		    },
    		axis: {
		        x: {
		            type: 'category',
		            tick: {
		                rotate: 90,
		                multiline: false
		            },
		            height: 300
		        }
		    },
		    legend: {
		        position: 'right'
		    },
		    color: {
    			pattern: ['#1f77b4']
    		}
		});
		var chart_posts = c3.generate({
		    bindto: '#chart_score_breakdown',
		    data: {
		    	x : 'x',
		    	columns: chart_score_breakdown_columns,
		    	type: 'bar',
		    	groups: [metricsNames]
		    },
		    bar: {
		    	width: {
		    		ratio: 0.5
		    	}
		    },
    		color: {
    			pattern: ['#1f77b4']
    		},
    		axis: {
		        x: {
		            type: 'category',
		            tick: {
		                rotate: 90,
		                multiline: false
		            },
		            height: 300
		        }
		    },
		    legend: {
		        position: 'right'
		    },
		    color: {
		        pattern: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
		    }
		});
	});
}

window.onload = loadChart;

function getCookie(cname) {
  console.log("getCookie: all cookies: "+document.cookie);
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1);
    if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
  }
  return "";
}