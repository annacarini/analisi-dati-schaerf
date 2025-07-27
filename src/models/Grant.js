import ColorUtilities from "../utils/ColorUtilities";

export default class Grant {
    constructor(nome, valore) {
        this.nome = nome;       // nome del grant
        this.valore = valore;     // valore del grant
        this.color = ColorUtilities.stringToColor(nome);
    }
}