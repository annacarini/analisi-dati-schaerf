export default class ColorUtilities {


    static randomColor() {
        return this.hslToString(this.randomColorArray());
    }

    static randomColorArray() {
        var h = Math.round(360 * Math.random());
        var s = Math.round(60 + 45 * Math.random());
        var l = Math.round(45 + 10 * Math.random());
        return [h, s, l];
    }

    static hslToString(col) {
        return "hsl(" + col[0] + ',' + col[1] + '%,' + col[2] + '%)';
    }

    static hslToArray(color) {
        var match = color.match(/(\d+(\.\d+)?)/g);
        const h = parseFloat(match[0]);
        const s = parseFloat(match[1]);
        const l = parseFloat(match[2]);

        return [h, s, l];
    }
}