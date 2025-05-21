export default function RadioButton({option, checked, onClick}) {

    return (
        <li className={"checked-" + checked} onClick={() => {onClick(option);}}>
            <input type="radio" name="" value={option} checked={checked} onClick={() => {onClick(option);}}/>{option}
        </li>
    );
}