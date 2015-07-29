# regdem2015

Registratordemonstrator 2015

# Installasjon

Denne installasjonsguiden tar deg gjennom installasjon av regdem2015, regdem2015-server og oppsett av testmiljø.

__Innhold__

1. [Systemkrav](#systemkrav)
2. [Installasjon av regdem2015](#installasjon-av-regdem2015)
3. [Installasjon av regdem2015-server (backend)](#installasjon-av-regdem2015-server-backend)
4. [Testing](#testing)

## Systemkrav

* Git
* nodejs
* Python versjon fra versjon 2.5 til og med versjon 2.7.10 (ikke versjon 3)

De fleste OS kommer med Python 2.x installert, og vil derfor ikke være nødvendig å gjøre noe mer med det. Windows kommer uten Python, og må derfor installeres på egenhånd.


## Installasjon av regdem2015

Følg disse stegene for å laste ned, og bygge, regdem2015:

```bash
git clone https://github.com/nvdb-vegdata/regdem2015
cd regdem2015
npm install         # installerer tilhørende pakker
npm run build       # bygger applikasjonen
```

Når dette er gjort skal du få en fungerende kart ved å åpne `index.html` i nettleseren. Skrive-API vil ikke fungere på denne måten.


#### Alternativ kjøring

Har du problemer med å hente data fra lese-API kan det være greit å kjøre regdem2015 på en enkel HTTP-server, uavhengig av backend-koden. Kall til skrive-API vil da ikke fungere. Dette kan gjøres ved å feks. kjøre enn enkel HTTP Server ved bruk av Python:

```bash
python -m SimpleHTTPServer 8001
```

Da kan siden aksesseres via `http://localhost:8001`


## Installasjon av regdem2015-server (backend)

Installasjon av Cookiemonster / backend for utviklign av regdem2015:

```bash
# klon regdem2015-server i samme mappe som regdem (ikke inne i regdem)
git clone https://github.com/nvdb-vegdata/regdem2015-server
cd regdem2015-server
npm install                       # installerer tilhørende pakker
```

Deretter må du opprette en `config.js` fil under `./regdem2015-server` med følgende informasjon:

```javascript
module.exports = {
  username: '',
  password: ''
}
```

_notat: brukerinformasjon må ha LDAP-tilgang, og være innenfor SVV-nettverket_

Før du kan kjøre opp applikasjonen må du lage et alias av regdem2015 i `regdem2015-server`-mappen. Alternativt kan du kopiere regdem2015 inn i regdem2015-server.

__For å lage alias på Unix/Linux:__

```bash
cd regdem2015-server              # pass på at du er inne i regdem2015-server mappen
ln -s /<path til>/regdem2015 .    # lager alias for regdem2015 inne i regdem2015-server
```

Server startes med kommandoen `node server.js` fra `./regdem2015-server`-mappen.

Serveren starter opp på port `8085`.

* API URL: http://localhost:8085/api
* Regdem URL: http://localhost:8085/app

## Testing

### RoboHydra

Robohydra benyttes som en enkel mock-server for å kunne simulere serverspørring med mock-data uten å måtte endre på produksjonskode.

Du trenger robohydra installert på maskinen med: `npm install robohydra -g`

Inne i `./regdem2015-server` kjører du `robohydra -n -P regdem`. RoboHydra-severen kjører opp på port `3000`.

* API URL: http://localhost:3000/api
* Regdem URL: http://localhost:3000/app
