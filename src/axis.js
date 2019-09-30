import { select, selectAll } from "d3-selection";
import { axisLeft, axisTop } from "d3-axis";
import initFormatter from "@flourish/number-formatter";
import { localization } from "./process_data";

import { max_horse_height } from "./size";
import state from "./state";
import data from "./data";

var getYAxisFormatter = initFormatter(state.y_axis_format);

function updateXAxis(x) {
	var visible_ticks = data.horserace.column_names.stages
		.reduce(function(arr, d, i) {
			if (d) arr.push(i);
			return arr;
		}, []);

	var xAxis = axisTop(x)
		.tickValues(visible_ticks)
		.tickFormat(function(d) {
			return data.horserace.column_names.stages[d];
		});

	var plot_margin_top = max_horse_height / 2;
	var rotate = -state.x_axis_rotate;
	var min_space = state.x_axis_label_size * 1.5;
	if (state.x_axis_rotate == "90") min_space = state.x_axis_label_size;
	else if (state.x_axis_rotate == "0") min_space = state.x_axis_label_size * 6;
	var previous_tick_x;

	var x_ticks = select(".x.axis").call(xAxis).selectAll(".tick");

	x_ticks.select("text")
		.style("text-anchor", rotate == "0" ? "middle" : "start")
		.style("font-size", state.x_axis_label_size + "px")
		.style("fill", state.x_axis_label_color)
		.attr("data-tick-index", function(d) { return d; })
		.attr("dx", function() {
			if (state.x_axis_rotate == "0") return 0;
			else if (state.x_axis_rotate == "90") return plot_margin_top;
			else return (plot_margin_top * 0.68) + 2;
		})
		.attr("dy", function() {
			if (state.x_axis_rotate == "0") return -plot_margin_top;
			else if (state.x_axis_rotate == "90") return "0.25em";
			else return (-plot_margin_top * 0.68) - 2;
		})
		.attr("y", 	0)
		.attr("transform", "rotate(" + rotate + ")")
		.attr("opacity", function() {
			var tick_x = this.getBoundingClientRect().x;
			var overlapping = previous_tick_x && tick_x < previous_tick_x;
			var tick_opacity = overlapping ? 0 : 1;
			previous_tick_x = overlapping ? previous_tick_x : this.getBoundingClientRect().x + min_space;
			return tick_opacity;
		});
}

function updateYAxis(y, w, duration) {
	var localeFunction = localization.getFormatterFunction();
	var yAxisFormat = getYAxisFormatter(localeFunction);

	var yAxis = axisLeft(y)
		.tickSize(-w)
		.tickFormat(function(d) {
			if (state.value_type == "ranks") return d % 1 == 0 ? d : "";
			return yAxisFormat(d);
		})
		.tickPadding(5);

	if (state.value_type == "ranks") yAxis.ticks(Math.min(data.horserace.length, state.y_axis_max_rank || Infinity));
	select(".y.axis").transition().duration(duration).call(yAxis);

	selectAll(".y.axis text")
		.style("font-size", state.y_axis_label_size + "px")
		.style("fill", state.y_axis_label_colors);

	selectAll(".y.axis line").style("stroke", state.y_axis_stroke_color);
	selectAll(".y.axis path").style("stroke", state.y_axis_stroke_color);
}

function updateAxes(x, y, w, duration) {
	updateXAxis(x);
	updateYAxis(y, w, duration);
}

export { updateAxes };
