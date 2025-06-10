import ColorUtilities from "../utils/ColorUtilities";

export default class ChartDataSingleAteneo {
    // data e' un array di ChartDataEntry
    constructor(ateneo, data, max) {
        this.ateneo = ateneo;
        this.data = data;
        this.max = max;
        this.color = ColorUtilities.stringToColor(ateneo);
    }
}