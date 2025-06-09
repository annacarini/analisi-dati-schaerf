
export default function TableData({data, yearStart, yearEnd}) {

    //const dataAtenei = data.data;

    // Crea lista di anni
    const yearsList = []
    for (let year = 0; year = yearStart; year <= yearEnd) {
        yearsList.push(year);
    }

    return (
        <div>
            tab
            {/*
            <table>
                <tr>
                {yearsList.map((dataAteneo, index) => 
                    <th key={index}>{dataAteneo.ateneo}</th>
                )}
                </tr>

                {data.data.map((dataAteneo, index) => 
                    <tr key={index}>
                        <td>{dataAteneo.ateneo}</td>
                    </tr>
                )}
            </table>
            */}
        </div>
    )
}