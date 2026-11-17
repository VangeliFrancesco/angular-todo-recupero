# Todo Lab — Angular e API REST

Progetto per il recupero di Informatica: gestione della risorsa **todos** di [JSONPlaceholder](https://jsonplaceholder.typicode.com/).

Account scelto per la consegna: **alexsiviper95**. I nomi degli altri componenti e le rispettive parti vanno aggiunti quando il gruppo è definito.

## Avvio

Installa Node.js 24 LTS, che include npm. Dal terminale nella cartella del progetto:

```sh
npm install
npm start
```

Apri `http://localhost:4200`. Per compilare e verificare:

```sh
npm run build
npm test
```

`npm run build` esegue **ng build**. Il risultato è in `dist/angular-todo/browser`.
Per un'installazione identica a quella verificata, usa pnpm 11.25.0 con il lockfile incluso:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
```

## Requisiti della consegna

| Requisito | Implementazione |
| --- | --- |
| GET elenco, GET singolo e POST con HttpClient | `src/app/services/todo.service.ts`: `loadAll`, `loadOne`, `create` |
| Signal privato e `asReadonly()` | `_todos`, `_selected` e gli stati di caricamento/errore nel servizio |
| Conteggio/filtro con `computed` | `src/app/pages/todo-list.ts`: totale, completate, da completare, ricerca e stato |
| Pagina elenco | `/todos` |
| Pagina dettaglio e navigazione | `/todos/:id`, con precedente/successivo e limiti 1/200 (estesi ai nuovi todo della sessione) |
| Indicatore di caricamento | Spinner in elenco/dettaglio, pulsante di salvataggio disabilitato durante il POST |
| Errore 404 e stato 0 distinti | `errorMessage` nel servizio; messaggi mostrati con `role="alert"` |

## Come funziona

Il servizio custodisce lo stato. I componenti leggono i signal pubblici senza modificarli direttamente. Le operazioni HTTP restituiscono Observable: le pagine si iscrivono e `takeUntilDestroyed` annulla le richieste quando il componente viene distrutto. `finalize` conclude il caricamento anche su errore o annullamento.

Il dettaglio osserva i parametri della route. `switchMap` annulla la richiesta precedente quando si preme precedente/successivo. `catchError` rimane all'interno della richiesta, così un 404 non interrompe la navigazione successiva.

La ricerca non invia richieste aggiuntive: `computed` filtra i dati del signal quando cambiano testo, stato o elenco.

**Limite dell'API:** i POST di JSONPlaceholder sono simulati e restituiscono sempre ID 201 per i todo. L'app assegna ID locali progressivi e conserva i nuovi elementi in memoria, inclusi i loro dettagli. Aggiornare l'elenco li mantiene; ricaricare il browser li elimina. Non c'è persistenza permanente né modifica dello stato dei todo esistenti.

## Verifiche manuali per la presentazione

1. Aprire `/todos`: verificare conteggi e filtro per stato; cercare una parola del titolo.
2. Aprire un dettaglio, poi precedente/successivo. Sul primo/ultimo elemento verificare il pulsante disabilitato.
3. Aprire `/todos/999`: deve comparire il messaggio 404. Tornare all'elenco.
4. Nei DevTools, scheda Network, selezionare Offline e premere Aggiorna: deve comparire lo stato 0. Ripristinare la rete e premere Riprova.
5. Con rete lenta, osservare lo spinner; creare un'attività e verificarne il dettaglio.
6. Creare una seconda attività: deve avere un ID diverso. Aggiornare l'elenco e verificare che restino entrambe; ricaricare il browser e osservare il limite documentato.

Lo stato 0 indica che il browser non ha ricevuto una risposta HTTP: può dipendere anche da CORS o da altri problemi di connessione, oltre alla rete assente.

I test automatici usano un backend HTTP simulato per verificare GET, POST, errori, recupero, cancellazione, conteggi, filtri e cambi di route, senza dipendere dalla rete.

## Lavoro di gruppo

Proposta da adattare alle persone effettive:

- Persona 1: modello, servizio HTTP, stato ed errori.
- Persona 2: elenco, computed, ricerca e modulo di creazione.
- Persona 3: routing, dettaglio, navigazione e verifica.

In due persone, dividere routing e verifiche tra entrambe. Il primo commit è la base iniziale assistita: ogni componente deve poi effettuare **i propri commit reali**, usando il proprio account e descrivendo le modifiche effettuate. Non attribuire questo codice ad altri componenti.

```sh
git clone URL_DEL_REPOSITORY
cd angular-todo-recupero
git switch -c feature/nome-parte
# Modificare e verificare il codice
git add src
git commit -m "Aggiunge filtro per utente"
git push -u origin feature/nome-parte
```

Aprire una pull request su GitHub per integrare le modifiche. Aggiungere qui una tabella con nomi, username e contributi reali prima della consegna. Ogni persona consegna lo stesso link del repository e il proprio username.

## Preparazione alla prova individuale

Saper spiegare il flusso pagina → servizio → HttpClient → risposta → signal → template, la differenza tra signal e computed e perché lo stato scrivibile è privato. Piccole modifiche utili per esercitarsi: filtro per userId, conteggio percentuale delle completate, nuovo campo nel riepilogo, cambiamento del testo d'errore.

Riferimenti ufficiali: [Angular signals](https://angular.dev/guide/signals), [HttpClient](https://angular.dev/guide/http), [routing](https://angular.dev/guide/routing), [JSONPlaceholder](https://jsonplaceholder.typicode.com/).
