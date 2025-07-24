import {React, useEffect, useState, useRef} from 'react';

import * as d3 from "d3";

import MultiAnalysis from './components/MultiAnalysis';
import SingleAnalysis from './components/SingleAnalysis';
import GrantsAnalysis from './components/GrantsAnalysis';


// import file pesi
import file_pesi from './DB/Pesi.csv';

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


// import file dei bandi
import file_bandi from './DB/bandi_formatted.csv';

// import file grants
import file_grants from './DB/grants.csv';


export default function Main() {

    const Options = {
        Multi: '0',
        Single: '1',
        Grants: '2'
    };

    // Per scegliere cosa vedere
    const [selectedOption, setSelectedOption] = useState(Options.Multi);

    //const CSV_PATH = "./DB/FilesUnitiCSV";
    const filePaths = [completo_2000,completo_2001,completo_2002,completo_2003,
        completo_2004,completo_2005,completo_2006,completo_2007,completo_2008,
        completo_2009,completo_2010,completo_2011,completo_2012,completo_2013,
        completo_2014,completo_2015,completo_2016,completo_2017,completo_2018,
        completo_2019,completo_2020,completo_2021,completo_2022,completo_2023,completo_2024];


    // PESI (inizializzati dentro loadPesi)
    const [pesi, setPesi] = useState({});

    // DATASET (inizializzato dentro loadDataset)
    const [dataset, setDataset] = useState([]);

    // BANDI (inizializzati dentro loadBandi)
    const [bandi, setBandi] = useState({});

    // BANDI (inizializzati dentro loadGrants)
    const [grants, setGrants] = useState({});

    // Per la progress bar del loading e per capire se ho caricato tutto
    const filesAmount = filePaths.length + 3;   // (file pesi, file bandi, file grants)
    var filesLoadedAmount = 0;
    const progressBar = useRef(null);
    const [everythingLoaded, setEverythingLoaded] = useState(false);


    useEffect(() => {
        //updateProgress(0);
        loadPesi();
        loadBandi();
        loadGrants();
        loadDataset();
    },[]);


    function incrementFilesLoaded() {

        filesLoadedAmount += 1;
        updateProgress(filesLoadedAmount);

        if (filesLoadedAmount == filesAmount) {
            setEverythingLoaded(true);
        }
    }
    
    function loadPesi() {
        d3.csv(file_pesi).then(
            function (data) {
                console.log("loaded pesi");
                //console.log(data);

                var p = {}
                for (let i=0; i<data.length; i++) {
                    p[data[i]["Fascia"]] = parseFloat(data[i]["Peso"]);
                }

                setPesi(p);
                incrementFilesLoaded();                
            }
        );
    }
    
    function loadBandi() {
        d3.csv(file_bandi).then(
            function (data) {
                console.log("loaded bandi");
                setBandi(data);
                incrementFilesLoaded();
            }
        );
    }
    
    function loadGrants() {
        d3.csv(file_grants).then(
            function (data) {
                console.log("loaded grants");
                setGrants(data);
                incrementFilesLoaded();
            }
        );
    }

    function loadDataset() {

        const promises = filePaths.map(filepath => d3.csv(filepath))

        // Per monitorare il progresso
        for (const promise of promises) {
            promise.then(() => { 
                incrementFilesLoaded();
            });
        }

        // Per quando caricano tutti i file
        Promise.all(promises).then(function(files) {
            setDataset(files);
            console.log("dataset ready");
        }).catch(function(err) {
            console.log(err)
        });
    }


    function updateProgress(progress) {

        if (progressBar.current == null) {
            //console.log("progress bar is null");
            return;
        }
        //console.log("updating progress bar");

        const progressPercentage = progress / filesAmount * 100;
        const progressBaseColor = "rgb(227, 227, 227)"; //'#C6C6C6';
        const progressColor = "rgb(29, 83, 163)";

        progressBar.current.style.background = `linear-gradient(to right,
          ${progressColor} 0%,
          ${progressColor} ${progressPercentage}%,
          ${progressBaseColor} ${progressPercentage}%,
          ${progressBaseColor} 100%)`;
    }

    return (
        <div id="main">
            {/* Barra pulsanti analisi singola/multipla */}
            <div className="analysis-type-row">
                <button className={"active-" + (selectedOption == Options.Multi)} onClick={() => {setSelectedOption(Options.Multi);}}>Più atenei</button>
                <button className={"active-" + (selectedOption == Options.Single)} onClick={() => {setSelectedOption(Options.Single);}}>Singolo ateneo</button>
                <button className={"active-" + (selectedOption == Options.Grants)} onClick={() => {setSelectedOption(Options.Grants);}}>Grants</button>
            </div>
            <hr className='row-under-buttons'/>
            { everythingLoaded
            ? <div>
                <div style={{display: (selectedOption == Options.Multi) ? 'block' : 'none', background: "none"}}><MultiAnalysis dataset={dataset} pesi={pesi} bandi={bandi}/></div>
                <div style={{display: (selectedOption == Options.Single) ? 'block' : 'none', background: "none"}}><SingleAnalysis dataset={dataset} pesi={pesi} bandi={bandi}/></div>
                <div style={{display: (selectedOption == Options.Grants) ? 'block' : 'none', background: "none"}}><GrantsAnalysis grants={grants}/></div>
            </div>
            : <div className="loader-container">
                <div className="loader-progress-bar" ref={progressBar}/>
                {/*<div className="loader"></div> */}
                Loading dataset...
              </div>
            }
        </div>
    )
}