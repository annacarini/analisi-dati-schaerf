import csv
import Values
import re

filename = "bandi.csv"
filename2 = "bandi2.csv"
filename3 = "bandi3.csv"
filename4 = "bandi4.csv"



# Per vedere tutti gli atenei dei bandi (spesso dopo " - " c'e' il nome del dipartimento, quindi prendo solo fino al trattino)
'''
atenei_bandi = []
with open(filename, "r", encoding='UTF-8', newline='') as file:
    reader = csv.reader(file)

    next(reader)    # skip header

    for row in reader:
        aten = row[3].split(" - ")[0]
        aten = aten.split(" – ")[0]
        aten = aten.lower()
        if (aten not in atenei_bandi):
            atenei_bandi.append(aten)

with open('atenei_bandi.txt', 'w+', encoding='UTF-8') as f:
    for items in atenei_bandi:
        f.write('%s\n' %items)

print(len(atenei_bandi))
'''


def findAteneo(aten):
    atenei = Values.VALUES_ATENEO.keys()

    for ateneo in atenei:
        #if aten == ateneo:
        #    return(aten, True)
        if aten in Values.VALUES_ATENEO[ateneo]:
            return (ateneo, True)
        
    return (aten, False)



# Per sostituire il valore dell'ateneo con quello del visualizzatore
'''
atenei_non_trovati = {}
with open(filename, "r", encoding='UTF-8', newline='') as file:
    with open(filename2, "w", encoding='UTF-8', newline='') as file2:
        
        reader = csv.reader(file)
        writer = csv.writer(file2, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)

        #next(reader)    # skip header

        for row in reader:

            newRow = row

            aten = row[3].split(" - ")[0]
            aten = aten.split(" – ")[0]
            aten = aten.lower()

            # Conforma nomi atenei risp a CercaUniversita'
            res = findAteneo(aten)
            if (res[1]):
                newRow[3] = res[0]
            else:
                aten = row[3]
                if (aten == "Università degli Studi" and row[4] == "Firenze"):
                    newRow[3] = 'FIRENZE'
                elif (aten in ["Università","Università degli Studi","UNIVERSITA' DEGLI STUDI","Università degli studi"]
                      and row[4] in ["Chieti","66100","chieti","CHIETI","Chieti-Pescara","CHIETI - PESCARA","CHIETI-PESCARA","Chieti - Pescara"]):
                    newRow[3] = "CHIETI-PESCARA"
                elif (aten == "Università degli Studi di Roma" or "Sapienza" in aten or "SAPIENZA" in aten or "sapienza" in aten):
                    newRow[3] = 'ROMA "La Sapienza"'
                elif (aten in ["Università degli Studi","UNIVERSITA'"] and row[4] in ["Roma","ROMA"]):
                    newRow[3] = 'Univ. Studi GUGLIELMO MARCONI - Telematica'
                elif (row[4] == "Sassari"):
                    newRow[3] = "SASSARI"
                elif (aten == "Dipartimento di Medicina Veterinaria" and row[4] == "Sassari"):
                    newRow[3] = "SASSARI"
                elif (aten.find("Dipartimento di") == 0 and row[4] == "Milano"):
                    newRow[3] = "MILANO"
                #elif (aten == "Scuola Internazionale Superiore di Studi Avanzati" and row[4] == "Trieste"):
                #    newRow[3] = "CHIETI-PESCARA"
                else:
                    if (aten not in atenei_non_trovati):
                        atenei_non_trovati[aten] = 1
                    else:
                        atenei_non_trovati[aten] += 1

            writer.writerow(newRow)
            #break

with open('atenei_non_trovati.txt', 'w+', encoding='UTF-8') as f:
    for item in atenei_non_trovati:
        #f.write('%s\n' %items)
        f.write(f"{atenei_non_trovati[item]},{item}\n")
'''



# Per mettere l'anno al posto della data completa
'''
with open(filename2, "r", encoding='UTF-8', newline='') as file:
    with open(filename3, "w", encoding='UTF-8', newline='') as file2:
        
        reader = csv.reader(file)
        writer = csv.writer(file2, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)

        for row in reader:
            newRow = row

            if (row[8] != "" and row[8] != "Data" and row[9] != "" and row[9] != "Data di Scadenza"):
                newRow[8] = row[8][-4:]
                newRow[9] = row[9][-4:]

            writer.writerow(newRow)
'''



# Per estrarre solo il codice del settore concorsuale e aggiungere l'area
#'''

def getAreaBySC(sc):
    # prendo i primi due caratteri
    sc_num_str = sc[:2]
    # trasformo in intero
    sc_num = int(sc_num_str)
    # visto che partono da 1, sottraggo 1 e lo uso come indice dentro tutti i valori di area
    return Values.VALUES_AREA[sc_num - 1]

with open(filename3, "r", encoding='UTF-8', newline='') as file:
    with open(filename4, "w", encoding='UTF-8', newline='') as file2:
        
        reader = csv.reader(file)
        writer = csv.writer(file2, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)

        # per le regex
        PATTERN = "[0-9][0-9]/[A-Z][0-9]"

        next(reader)    # skip header
        header = "Titolo,Fascia,Destinatari,Organizzazione,Citta,Paese,SSD,Settore Concorsuale,Area,Data,Data di Scadenza,Numero di Posti,Tipo di Contratto,Tempo,Ore Settimanali,Link"
        writer.writerow(header.split(",")) # write new header

        for row in reader:
            # aggiungo l'area in posizione 8
            newRow = row[:8] + [""] + row[8:]

            regex_res = re.findall(PATTERN, row[7])
            if (len(regex_res) > 0):
                newRow[7] = regex_res[0]
                newRow[8] = getAreaBySC(regex_res[0])

            writer.writerow(newRow)

#'''