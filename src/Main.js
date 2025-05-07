import {React, useEffect, useState} from 'react';

import * as d3 from "d3";

import MultiAnalysis from './components/MultiAnalysis';
import SingleAnalysis from './components/SingleAnalysis';

import Values from './Values';

export default function Main() {

    const CSV_PATH = "/DB/FilesUnitiCSV";
    //const CSV_PATH = "./DB/FilesUnitiCSV";

    // nomi colonne
    const FIELD_ATENEO = "Ateneo";
    const FIELD_NOME = "Cognome e Nome";
    const FIELD_FACOLTA = "Facoltà";
    const FIELD_FASCIA = "Fascia";
    const FIELD_GENERE = "Genere";
    const FIELD_SC = "S.C.";
    const FIELD_SSD = "S.S.D.";
    const FIELD_STRUTTURA = "Struttura di afferenza";
    const FIELD_AREA = "area";
    const FIELD_YEAR = "year";

    // Per scegliere se analizzare piu atenei insieme o solo uno
    const [multiSelected, setMultiSelected] = useState(true);


    // DATASET (inizializzato dentro loadDataset)
    const [dataset, setDataset] = useState([]);
    const [datasetReady, setDatasetReady] = useState(false);


    useEffect(() => {
        loadSingleCSV();
    },[]);


    // Inizializza il form
    function onBodyLoad() {

    }

    function loadSingleCSV() {
        d3.csv("/completo_2000.csv").then(
            function (data) {
                console.log("loaded");
                console.log(data[0]);
            }
        );
    }

    function loadDataset() {
        const filePaths = []
        for (let i = 2000; i < 2025; i++) {
            filePaths.push(`${CSV_PATH}/completo_${i}.csv`);
        }

        Promise.all(
            filePaths.map(filepath => d3.csv(filepath))
        ).then(function(files) {
            setDataset(files);
            setDatasetReady(true);
            
            console.log(files[0][0]);
            //onDatasetLoaded(files);
        }).catch(function(err) {
            console.log(err)
        })
    }

    function onDatasetLoaded(files) {

        var selectedAteneo = ['BOLOGNA', 'ROMA "Tor Vergata"'];
    
        /*
        var x = d3.scaleBand()
                    .domain(data.map(function(d) { return d["frutto"]}))
                    .range([ 0, width ]);
        */
        //let c = d3.count(dataset[0], d => d[FIELD_ATENEO]==selectedAteneo);
    
        // vedi quanti professori ci sono nel 2005 per gli atenei della lista
        let c = files[0].filter(d => selectedAteneo.includes(d[FIELD_ATENEO])).length;
        console.log("conta: " + c)
    
        console.log(Values.VALUES_SC)
    }

    return (
        <div>
            prova main
            <div>
                {multiSelected
                    ? <MultiAnalysis/>
                    : <SingleAnalysis/>
                }
            </div>
        </div>
    )
}