import pandas as pd
import csv
import re
import AssociazioneCodiceUniversita

filename = "db-operations/erc-grants.xlsx"
filenameitaly = "db-operations/erc-grants-italy.csv"
filenamecodiciuniversita = "db-operations/codici-universita.txt"
filenameitalyateneicorretti = "db-operations/erc-grants-italy-atenei.csv"


# converti xslx in csv con solo righe che hanno country = italy
'''
df = pd.ExcelFile(filename).parse('Sheet1')

with open(filenameitaly, "w", encoding='UTF-8', newline='') as file:
    writer = csv.writer(file)

    # scrivi header
    header = ["Project Number","Acronym","Researcher(s)","Ateneo","Grant Type","year","EU contribution"]
    writer.writerow(header)

    for i in range(0, len(df)):
        if (df["Country"].iloc[i] == "Italy"):
            newRow = [df["Project Number"].iloc[i], df["Acronym"].iloc[i],  df["Researcher(s)"].iloc[i],
                      df["Host Institution(s)"].iloc[i], df["Grant Type"].iloc[i],
                      df["Call Year"].iloc[i], df["EU contribution"].iloc[i]]
            writer.writerow(newRow)
'''


# apri file csv italy e prendi per ogni riga il codice dell'università 
'''
codici_universita = []
codici_trovati = []
PATTERN = "[[0-9]+,IT]"

with open(filenameitaly, "r", encoding='UTF-8', newline='') as file:
    reader = csv.reader(file)

    next(reader)    # skip header

    for row in reader:
        # trova codice universita'
        regex_res = re.findall(PATTERN, row[3])
        if (len(regex_res) > 0):
            codice = regex_res[0]
            if (codice not in codici_trovati):
                codici_trovati.append(codice)
                codici_universita.append((codice,row[3]))
        else:
            print("codice non trovato")
            print(row)

with open(filenamecodiciuniversita, 'w+', encoding='UTF-8') as f:
    for item in codici_universita:
        #f.write('%s\n' %item)
        f.write(f"'{item[0]}':'{item[1]}',\n")
'''



# sostituisci il nome dell'organizzazione con i nomi degli atenei dentro associaz codici universita

PATTERN_GENERICO = "[[0-9]+,[A-Z]+]"
PATTERN_IT = "[[0-9]+,IT]"

with open(filenameitaly, "r", encoding='UTF-8', newline='') as file:
    with open(filenameitalyateneicorretti, "w", encoding='UTF-8', newline='') as file2:
        
        reader = csv.reader(file)
        writer = csv.writer(file2, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)

        next(reader)    # skip header

        # scrivi header (con una colonna che indica quante organizzazioni riguarda il grant)
        header = ["Project Number","Acronym","Researcher(s)","Ateneo","Numero di organizzazioni","Grant Type","year","EU contribution"]
        writer.writerow(header)

        for row in reader:

            # vedi quante organizzazioni in totale
            regex_res = re.findall(PATTERN_GENERICO, row[3])
            numero_organizzazioni = len(regex_res)

            # trova codice universita' italiane
            regex_res = re.findall(PATTERN_IT, row[3])

            ateneo = ""

            if (len(regex_res) > 0):

                #print(regex_res)

                # trova i nomi dell'ateneo nell'associazione codice-nome
                for i in range(0, len(regex_res)):
                    if (regex_res[i] in AssociazioneCodiceUniversita.Associazione):
                        if (ateneo != ""):
                            ateneo += ","
                        ateneo += AssociazioneCodiceUniversita.Associazione[regex_res[i]]

            # scrivi la riga solo se ateneo non e' una stringa vuota, ovvero se la riga riguarda un ateneo italiano
            if (ateneo != ""):
                newRow = row[:3] + [ateneo, numero_organizzazioni] + row[4:]
                writer.writerow(newRow)

