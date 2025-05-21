export default function Checkbox({option, checked, onClick}) {

    return (
        <li className={"checked-" + checked} onClick={() => {onClick(option);}}>
            <input type="checkbox" checked={checked}/>{option}
        </li>
    );
}