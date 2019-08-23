import { data_new } from "./process_data";
import state from "./state";
import initColors from "@flourish/custom-colors";

var color = initColors(state.color, true);

function updateColors() {
	color.updateColors(data_new.map(function(d) { return d.name; }));
}

export { updateColors, color };
