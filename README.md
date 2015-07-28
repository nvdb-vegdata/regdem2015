# regdem2015

## Installasjon

__Systemkrav__

* nodejs


### Installasjon av regdem:

```bash
git clone https://github.com/nvdb-vegdata/regdem2015
cd regdem2015
npm install         # installerer tilhørende pakker
npm run build       # bygger applikasjonen
```


__Alternativ kjøring__

regdem2015 kan kjøre uavhengig av backend. Kall til skriveAPI vil da ikke fungere. Dette kan gjøres ved å feks. kjøre enn enkel HTTP Server ved bruk av Python:

```bash
python -m SimpleHTTPServer 8001
```

Da kan siden aksesseres via `http://localhost:8001`


### CookieMonster

Installasjon av Cookiemonster / backend for utviklign av regdem2015

```bash
# klon regdem2015-server i samme mappe som regdem (ikke inne i regdem)
git clone https://github.com/nvdb-vegdata/regdem2015-server
cd regdem2015-server
ln -s /<path til>/regdem2015 .    # lager alias for regdem2015 inne i regdem2015-server
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

Server startes med kommandoen `node server.js` fra `./regdem2015-server`-mappen.

Serveren starter opp på port `8085`.

* API URL: http://localhost:8085/api
* Regdem URL: http://localhost:8085/app

### Testing

#### RoboHydra

Robohydra benyttes som en enkel mock-server for å kunne simulere serverspørring med mock-data uten å måtte endre på produksjonskode.

Du trenger robohydra installert på maskinen med: `npm install robohydra -g`

Inne i `./regdem2015-server` kjører du `robohydra -n -P regdem`. RoboHydra-severen kjører opp på port `3000`.

* API URL: http://localhost:3000/api
* Regdem URL: http://localhost:3000/app
