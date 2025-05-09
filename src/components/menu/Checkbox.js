export default function Checkbox({option, checked, onClick}) {

    return (
        <li onClick={() => {onClick(option);}}><input type="checkbox" checked={checked}/>{option}</li>
    );
}