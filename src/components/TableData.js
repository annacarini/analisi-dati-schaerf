
import '../App.css';


export default function TableData({data, title}) {

    if (data.data.length < 1) return;

    // Prendi gli anni da data
    const dataFirstAteneo = data.data[0].data;
    const yearStart = dataFirstAteneo[0].anno;
    const yearEnd = dataFirstAteneo[dataFirstAteneo.length -1].anno;

    // Crea lista di anni
    if (yearEnd < yearStart) return;
    const yearsList = [];
    for (let year = yearStart; year <= yearEnd; year++) {
        yearsList.push(year);
    }

    return (

            <table className="table-data">
                <tr>
                    <th className='table-data-title'>{title}</th>
                    {yearsList.map((year, index) => 
                        <th className="table-data-entry" key={index}>{year}</th>
                    )}
                </tr>

                {data.data.map((dataAteneo, index) => 
                    <tr className="table-data-row" key={index}>
                        <td className="table-data-entry table-data-first-column">{dataAteneo.ateneo}</td>
                        {dataAteneo.data.map((dataYear, index) => 
                            <td className="table-data-entry" key={index}>{dataYear.conta}</td>
                        )}
                    </tr>
                )}
            </table>

    )
}