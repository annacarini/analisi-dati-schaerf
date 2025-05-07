import {React, useEffect, useState} from 'react';

import * as d3 from "d3";

import MultiAnalysis from './components/MultiAnalysis';
import SingleAnalysis from './components/SingleAnalysis';

import Values from './DB/Values';

// import file csv - mi sa che va fatto per forza cosi se no non li vede
import completo_2000 from './DB/FilesUnitiCSV/completo_2000.csv';
import completo_2001 from './DB/FilesUnitiCSV/completo_2001.csv';
import completo_2002 from './DB/FilesUnitiCSV/completo_2002.csv';
import completo_2003 from './DB/FilesUnitiCSV/completo_2003.csv';
import completo_2004 from './DB/FilesUnitiCSV/completo_2004.csv';
import completo_2005 from './DB/FilesUnitiCSV/completo_2005.csv';
import completo_2006 from './DB/FilesUnitiCSV/completo_2006.csv';
import completo_2007 from './DB/FilesUnitiCSV/completo_2007.csv';
import completo_2008 from './DB/FilesUnitiCSV/completo_2008.csv';
import completo_2009 from './DB/FilesUnitiCSV/completo_2009.csv';
import completo_2010 from './DB/FilesUnitiCSV/completo_2010.csv';
import completo_2011 from './DB/FilesUnitiCSV/completo_2011.csv';
import completo_2012 from './DB/FilesUnitiCSV/completo_2012.csv';
import completo_2013 from './DB/FilesUnitiCSV/completo_2013.csv';
import completo_2014 from './DB/FilesUnitiCSV/completo_2014.csv';
import completo_2015 from './DB/FilesUnitiCSV/completo_2015.csv';
import completo_2016 from './DB/FilesUnitiCSV/completo_2016.csv';
import completo_2017 from './DB/FilesUnitiCSV/completo_2017.csv';
import completo_2018 from './DB/FilesUnitiCSV/completo_2018.csv';
import completo_2019 from './DB/FilesUnitiCSV/completo_2019.csv';
import completo_2020 from './DB/FilesUnitiCSV/completo_2020.csv';
import completo_2021 from './DB/FilesUnitiCSV/completo_2021.csv';
import completo_2022 from './DB/FilesUnitiCSV/completo_2022.csv';
import completo_2023 from './DB/FilesUnitiCSV/completo_2023.csv';
import completo_2024 from './DB/FilesUnitiCSV/completo_2024.csv';


export default function Main() {

    //const CSV_PATH = "./DB/FilesUnitiCSV";
    const filePaths = [completo_2000,completo_2001,completo_2002,completo_2003,
        completo_2004,completo_2005,completo_2006,completo_2007,completo_2008,
        completo_2009,completo_2010,completo_2011,completo_2012,completo_2013,
        completo_2014,completo_2015,completo_2016,completo_2017,completo_2018,
        completo_2019,completo_2020,completo_2021,completo_2022,completo_2023,completo_2024];


    // Per scegliere se analizzare piu atenei insieme o solo uno
    const [multiSelected, setMultiSelected] = useState(true);


    // DATASET (inizializzato dentro loadDataset)
    const [dataset, setDataset] = useState([]);
    const [datasetReady, setDatasetReady] = useState(false);


    useEffect(() => {
        loadDataset();
    },[]);


    // Inizializza il form
    function onBodyLoad() {

    }

    /*
    function loadSingleCSV() {
        d3.csv(completo_2000).then(
            function (data) {
                console.log("loaded");
                console.log(data[0]);
            }
        );
    }
    */

    function loadDataset() {
        /*
        const filePaths = []
        for (let i = 2000; i < 2025; i++) {
            filePaths.push(`${CSV_PATH}/completo_${i}.csv`);
        }
        */

        Promise.all(
            filePaths.map(filepath => d3.csv(filepath))
        ).then(function(files) {
            setDataset(files);
            setDatasetReady(true);
            console.log("dataset ready");
        }).catch(function(err) {
            console.log(err)
        })
    }


    return (
        <div>
            Analisi dati
            {/* Barra pulsanti analisi singola/multipla */}
            <div className="flex-row">
                <button onClick={() => {setMultiSelected(true);}}>Più atenei</button>
                <button onClick={() => {setMultiSelected(false);}}>Singolo ateneo</button>
            </div>
            {datasetReady
            ? <div>
                {multiSelected
                    ? <MultiAnalysis dataset={dataset}/>
                    : <SingleAnalysis/>
                }
            </div>
            : <div>
                Loading dataset...
              </div>
            }
        </div>
    )
}