import Colors from "../utils/Colors";
import ColorUtilities from "../utils/ColorUtilities";

export default class ChartDataSingleAteneo {
    // data e' un array di ChartDataEntry
    constructor(ateneo, data, max) {
        this.ateneo = ateneo;
        this.data = data;
        this.max = max;

        if (ateneo in Colors.COLORS) {
            this.color = Colors.COLORS[ateneo];
        }
        else {
            this.color = ColorUtilities.randomColor();
        }
    }
}