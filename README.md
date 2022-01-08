# **Progetto Esame Programmazione web**
Creazione di un servizio web per visionare i tragitti svolti durante una determinata giornata.
Basato su Tomcat 9 e SQLite.
# installazione software
1. Copiare il file .war nella cartella webapp di Tomcat
2. Aprire il file web.xml e modificare il contextParam inserendo il path assoluto del database SQLite.
3. Aprire il browser sulla pagina http://localhost:8080/BilleMatteoProgettoEsame/
# Utilizzo
-  **login o signUp in alto a destra:**
	- Un utente di prova con alcuni viaggi è gia creato Name: admin Password: admin
- **Visualizzazione viaggi:**
	- possibilità di cambiare giorno con i bottoni `+1` e `-1` oppure con il dataPicker;
	- Possibilità di aggiungere un viaggio con il bottone `Aggiungi viaggio`;
	- Possibilità di visualizzare o cancellare un determinato viaggio con il menù dropdown  `Opzioni`;
	- ***Extra***:
		- Se si clicca sulla casella di un viaggio il viaggio verrà evidenziato.
- **Visualizzazione tappe di un viaggio:**
	- visualizzazione delle tappe con latitudine e longitudine e il testo aggiuntivo se un punto importante ne ha;
	- possibilità di modificare il viaggio attraverso il bottone `Modifica Viaggio`
	- ***Extra***:
		- Se si clicca sulla casella di una tappa comparirà un pallino sulla tappa.
		- Se la tappa è importante la tappa viene segnata con un pin.
- **Modifica tappe di un viaggio:**
	- possibilità di modificare/cancellare le tappe con il menù dropdown `Opzioni`.
	- possibilità di creare una nuova tappa in coda a quelle esistenti sia con il bottone `Aggiungi tappa` sia cliccando nel punto desiderato della mappa.
	- possibilità di impostare una tappa come importante. Dal dropdown menù `Opzioni` selezionare `modifica` e mettere il check sulla checkbox, è inoltre possibile aggiungere un piccolo testo da visualizzare nella schermata di visualizzazione.
	- Possibilità di cambiare nome al viaggio
	- Possibilità di cambiare mezzo di trasporto del viaggio
