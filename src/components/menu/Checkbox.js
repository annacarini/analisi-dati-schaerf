export default function Checkbox({option, checked, onClick}) {

    return (
        <li class={"checked-" + checked} onClick={() => {onClick(option);}}><input type="checkbox" checked={checked}/>{option}</li>
    );
}