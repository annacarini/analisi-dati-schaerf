import './Charts.css';

export default function ChartLegend({text, color}) {

    /*
    return (
        <div style={{display: 'flex'}}><div style={{width: '100px', height: '30px', backgroundColor: color}}></div>{text}</div>
    );
    */
    return (
        <div className="chart-legend">
            <div className="chart-legend-color" style={{backgroundColor: color}}/>
            <div className="chart-legend-text">{text}</div>
        </div>
    );
}