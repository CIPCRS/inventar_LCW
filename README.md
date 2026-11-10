# Inventar LCW Offline — aplicație de inventar pe PDA

Aplicație web (PWA) pentru inventarul fizic al stocului **RO-LCWOFF** (LC Waikiki Offline), pe același principiu ca
„Inventar PDA" de la Martur: rulează în browserul PDA-ului Zebra, login cu **nume + PIN**, progres sincronizat în
timp real între echipe prin Firebase (Cloud Firestore, în proiectul `inventar-martur`), raport Excel scriptic vs. fizic la final.

Diferența față de Martur: aici stocul e la nivel de **cutie** (fiecare linie din export = 1 cutie, cantitate 1, cod unic
„Item Number / SSCC"), așa că inventarul se face pe **prezență**, nu pe cantitate:
la fiecare locație se scanează eticheta locației, apoi toate cutiile găsite acolo.

## Fișiere

| Fișier | Rol |
|---|---|
| `index.html` | aplicația (PDA + panou admin) |
| `config.js` | configurare: `demo`, administratori, datele Firebase |
| `demo-stoc.js` | stocul din `RO-LCWOFF_View_Item_1.xlsx` pentru modul demo (se poate șterge în producție) |
| `xlsx.full.min.js` | biblioteca SheetJS pentru import/export Excel (copie locală, merge și fără CDN) |
| `firestore.rules` | regulile Firestore pentru colecțiile `lcw_*` (se adaugă în regulile proiectului) |
| `manifest.webmanifest`, `sw.js`, `icon.svg` | PWA: „Adaugă pe ecranul principal", cache pentru WiFi slab |

## Fluxul pe PDA

1. **Login** cu nume + PIN.
2. **Alegi aleea** (A10…A18 sau „Zone fără locație" = WCD / WR2 / WIO). Se vede progresul fiecărei alei. Poți și să
   scanezi direct o etichetă de locație — aplicația sare singură la aleea ei.
3. **Scanezi locația** de la raft (ex. `A15345001`). Pe ecran apar cutiile așteptate acolo (ultimele 6 cifre mari).
4. **Scanezi cutiile**:
   - cutie așteptată aici → ✓ verde, beep scurt;
   - cutie din **altă locație** → ↙ portocaliu, „mutată aici · scriptic la …" (se marchează automat, fără întrebări);
   - cutie care **nu există în stoc** → întreabă dacă o adaugă ca „cutie nouă";
   - cutie deja scanată în altă parte → întreabă dacă o înregistrează aici (ultima scanare rămâne valabilă).
5. **Închizi locația**: scanezi următoarea locație sau apeși „Locație gata ✓". Dacă lipsesc cutii, aplicația le
   listează și cere **confirmarea lipsei** („Confirm lipsă" / „Mai caut").
6. „Anulează ultima" anulează ultima scanare de cutie. O locație deja numărată poate fi redeschisă oricând
   (apare cine a numărat-o și când); scanările noi se adaugă.

Codurile scanate sunt normalizate: SSCC cu prefix `00` (20 cifre) e curățat automat, spațiile se elimină.

## Panoul admin (nume din `admini` în config.js)

- **Progres**: cutii găsite / mutate / lipsă / nenumărate / noi, pe alei și pe echipe, în timp real.
- **Import stoc**: încarci exportul WMS `RO-LCWOFF_View_Item*.xlsx` → se creează un inventar nou, activ pe toate PDA-urile.
  Coloane folosite: *Item Number / SSCC, Storage Loc., WH Area ID, Quality Lot, Arrival, Status, Batch*.
- **Raport Excel**: `Stoc` (fiecare cutie cu *Status inventar* = Găsit / Mutat / Lipsă / Nenumărat, *Locație fizică*,
  *Diferență*, cine și când), `Cutii noi`, `Locații` (numărate, de cine, lipsă confirmate), `Sumar alei`. Toate cu filtru.
- **Utilizatori**: creezi conturile echipelor (nume + PIN 4–8 cifre).
- **Inventare**: lista inventarelor, activare, ștergere.

## Punere în funcțiune (GitHub Pages + Firebase) — pașii în Edge

Aplicația stă în proiectul Firebase existent **`inventar-martur`** (plan Blaze), alături de aplicația Martur:
colecțiile ei sunt prefixate `lcw_` și conturile de utilizator sunt comune (același nume + PIN pe ambele aplicații).

### 1. Firebase (proiectul inventar-martur)
1. [console.firebase.google.com](https://console.firebase.google.com) → proiectul **inventar-martur**.
2. **Build → Firestore Database → Rules** → adaugă blocul din `firestore.rules` în interiorul `match /databases/{database}/documents { … }`,
   sub regulile existente ale Martur-ului → **Publish**. (Dacă regulile existente permit deja orice utilizator autentificat
   pe `match /{document=**}`, nu mai e nevoie de nimic.)
3. **Authentication → Settings → Authorized domains** → verifică să existe domeniul GitHub Pages folosit (`cipcrs.github.io`).
4. **Project settings (rotița) → General → Your apps** → aplicația web existentă → **SDK setup and configuration → Config** →
   copiază `apiKey`, `authDomain`, `projectId`, `appId` (identice cu cele din `config.js` de la Martur).
5. **Usage and billing → Details & settings → Budgets** (sau Google Cloud → Billing → Budgets & alerts) → creează un buget de
   ex. 5 € cu alertă la 50 % / 100 %, ca să fii anunțat dacă apare vreodată un consum neașteptat.

### 2. config.js
```js
demo: false,
admini: ['adrian'],
domeniuEmail: 'inventar-martur.app',   // același ca în config.js de la Martur, ca să meargă aceleași conturi
prefix: 'lcw_',
firebase: { apiKey: '…', authDomain: 'inventar-martur.firebaseapp.com', projectId: 'inventar-martur', appId: '…' }
```
Conturile echipelor: cele de la Martur merg direct; altele noi se creează din Admin → Utilizatori.

### 3. GitHub Pages
1. Repo nou (ex. `CIPCRS/inventar_LCW`, public) → **Add file → Upload files** → toate fișierele din pachet
   (`demo-stoc.js` nu mai e necesar când `demo: false`).
2. **Settings → Pages → Branch: main / (root) → Save**. După 1–2 minute: `https://cipcrs.github.io/inventar_LCW/`.
3. Pe PDA: deschide adresa în Chrome → meniu → **Add to Home screen**.

### 4. PDA Zebra (DataWedge)
Profilul DataWedge pentru Chrome trebuie să aibă **Keystroke output** activ, cu **Enter (`\n`) ca sufix** — exact ca la
aplicația Martur. Aplicația ascunde tastatura virtuală pe câmpul de scanare; butonul ⌨︎ o activează când vrei să tastezi
manual un cod.

## Consum Firestore și costuri (plan Blaze)

Modelul de date e „un document per cutie" (ca la Martur), în timp real. Pe planul gratuit Spark ar fi depășit limita de
20.000 scrieri/zi la un inventar general (27.600 cutii importate + 27.600 scanări), de aceea proiectul trebuie să fie pe Blaze.
Primele 20.000 scrieri și 50.000 citiri pe zi rămân gratuite și pe Blaze; peste ele, tarifele sunt 0,18 $ / 100.000 scrieri
și 0,06 $ / 100.000 citiri (regiunea europe-west).

| Operațiune | Consum | Cost orientativ |
|---|---|---|
| Import stoc (27.600 cutii) | 27.600 scrieri | ≈ 0,02 $ peste cota gratuită |
| O zi de inventar general, 15 PDA-uri | ≈ 27.600 scrieri (scanări + locații) | ≈ 0,02 $ |
| PDA care își încarcă aleea | ≈ 3.000 citiri (o singură dată; cache-ul local reia de unde a rămas) | — |
| Panoul admin deschis (dashboard / raport) | ≈ 27.600 citiri la prima deschidere, apoi 1 citire per scanare | ≈ 0,02 $ per deschidere |
| Ștergerea unui inventar vechi | ≈ 55.000 ștergeri | ≈ 0,05 $ |

Un inventar general complet costă deci sub 0,20 $; numărările fragmentate stau de regulă în cota gratuită. Bugetul cu alertă
de la pasul 1.5 e plasa de siguranță.

## Mod demo

`demo: true` în `config.js` (așa e livrat): nu are nevoie de Firebase, folosește stocul din `demo-stoc.js`, orice nume + PIN
intră, iar scanările se salvează doar în browserul respectiv (nu se sincronizează între device-uri). Numele `adrian` sau
`admin` deschid și panoul admin. În demo, un stoc importat trăiește doar până la reîncărcarea paginii.
