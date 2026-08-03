# Task: Lime Savings Calculator — interaktivni ROI kalkulator za salone

# Specifikacija: Lime Savings Calculator

## 1. Pregled
**Lime Savings Calculator** je interaktivno, vizualno privlačno spletno orodje, namenjeno salonom (frizerstvo, brivstvo, kozmetični in lepotni saloni), ki izračuna mesečno in letno izgubo prihodka zaradi neudeležb (no-show) in prikaže, kako hitro se naročnina na Lime Booking povrne z zmanjšanjem izpadov.

Orodje je zasnovano za hitro, zabavno uporabo z realnočasovnimi preračuni ob sprotnem spreminjanju parametrov. Uporabnik lahko konfiguracijo deli prek URL-povezave, ki vsebuje vse izbrane vrednosti – prejemnik pa vidi enako stanje in lahko sam preizkuša nastavitve.

## 2. Ciljne skupine in trg
- Slovenski saloni, v prvi fazi, z možnostjo enostavne razširitve na Hrvaško in Srbijo.
- Poslovne panoge: frizerstvo, brivstvo, kozmetični saloni, druge lepotne storitve.

## 3. Funkcionalnosti

### 3.1 Izbira panoge
Uporabnik izbere kategorijo izmed naslednjih (v slovenščini):
- Frizerstvo
- Brivstvo
- Kozmetični saloni
- Druge lepotne storitve

### 3.2 Izbira regije in povprečne cene
Regije pokrivajo Slovenijo, s tipičnimi povprečnimi cenami storitev po panogah in regijah:
- Osrednjeslovenska (Ljubljana)
- Celjska
- Maribor
- Primorska
- Gorenjska
- Preostale regije (po potrebi združene)

Cene so ocenjene na podlagi javno dostopnih podatkov ali tržnih raziskav; uporabljene vrednosti so **približne** – dovoljeno je odstopanje ±15 %. Pri izračunu se upošteva povprečna cena ene storitve za izbrano panogo/regijo.

### 3.3 Vnos števila neudeležb
Uporabnik vnese število odpovedi / neudeležb:
- Na teden **ali** na mesec (jasno označeno).
- Vnos je lahko z drsnikom ali numeričnim poljem, ki se odziva v realnem času.

### 3.4 Izračuni in prikaz
Na podlagi vnosov se sproti izračunajo in prikažejo:
- **Mesečna izguba prihodka** (izračun: število neudeležb na mesec × povprečna cena storitve).
- **Letna izguba prihodka** (mesečna izguba × 12).
- **Prihranek z Lime Booking**:
  - Predpostavka: Lime Booking zmanjša neudeležbe za **60 %** (vrednost med 50–70 %, povzeta po industrijskih študijah o digitalnih rezervacijah in morebitnih podatkih Lime). Vir naj bo naveden v opombi.
  - Izračun: prihranek = letna izguba × 0,6.
- **Točka preloma (ROI)**:
  - Mesečni strošek Lime Booking: vzeta aktualna cena naročnine iz uradne spletne strani limebooking.si (če obstaja več paketov, se privzame osnovni paket za mikro/samostojne salone).
  - Prikaz: »Lime Booking se povrne v X mesecih« (strošek naročnine / mesečni prihranek).
  - Vizualni poudarek: če je ROI < 2 meseca, posebna ikona/barva (npr. zelena), sicer rumena/oranžna.

Vsi izračuni se osvežijo takoj ob spremembi katerekoli nastavitve.

### 3.5 Deljive povezave
URL vsebuje vse parametre (panoga, regija, število neudeležb) kot query string:  
`?category=frizerstvo&region=osrednjeslovenska&noshows=5&period=weekly`  

Ko uporabnik spremeni nastavitve, se URL takoj posodobi (replaceState). Gumb »Kopiraj povezavo« enostavno skopira celoten URL v odložišče. Prejemnik povezave vidi enako konfiguracijo in jo lahko poljubno spreminja – njegove spremembe se odražajo v njegovem lokalnem URL-u.

## 4. Oblikovanje in uporabniška izkušnja

### 4.1 Vizualna identiteta
- Sledi se enakim smernicam, barvam, pisavam in vzdušju kot obstoječe Lime aplikacije (lime-api-v2, Trial-pro, Trial-email, lime-chat-booking), dostopne v interni mapi `clave` (repozitorij).
- Uporaba značilne limetne zelene barve, belih ozadij, zaobljenih robov, prijazne tipografije.
- Mobilno-prvi pristop (responsive), čist in moderen videz, hkrati igriv in profesionalen.

### 4.2 Interaktivnost in animacije
- Realnočasovni odziv: številke se posodobijo z gladkimi prehodi (CSS transition / framer-motion).
- Dovoljene so subtilne mikroanimacije (npr. poudarjanje spremenjenih vrednosti, animirani prikazi prihrankov).
- Uporabniški vmesnik je preprost in vodi uporabnika skozi 3 korake: izbira panoge, izbira regije, vnos neudeležb.

## 5. Podatki in viri
- Cene storitev: interno raziskane in vnesene v strukturiran JSON/objekt po panogah in regijah.
- Statistika zmanjšanja neudeležb: uporabi se 60 %, s sklicem na splošne raziskave (npr. »Digital booking systems reduce no-shows by up to 70 %« – vir: Journal of Service Management, 2022) ali na lastne podatke Lime (če so javno objavljeni). Navedba vira bo v drobnem tisku pod izračunom.
- Cena Lime Booking: pridobljena s spletne strani limebooking.si (ali druge uradne strani); če obstaja več paketov, se uporabi najnižja polna cena, jasno označena.

## 6. Tehnične specifikacije

### 6.1 Arhitektura
- Spletna aplikacija, gostovana na Vercel.
- Okvir: Next.js z uporabo statičnega generiranja (SSG) za osnovno stran in strežniškega upodabljanja (SSR) ali inkrementalne statične regeneracije (ISR) za deljive URL-je – s tem so povezave indeksirane in prijazne SEO.
- Brez zunanjega backend-a; vsi izračuni tečejo na odjemalcu, parametri pa se iz URL-ja preberejo na strežniku za SSR meta podatke.

### 6.2 Upravljanje stanja in URL-ja
- React state za vse izbire; ob spremembi se s `router.replace` osveži query string brez ponovnega nalaganja strani.
- Za SEO ob prvem obisku (ali direktnem URL-ju) Next.js na strežniku prebere parametre in vstavi ustrezne meta oznake ter izračuna začetne vrednosti.

### 6.3 SEO in meta podatki
Vsaka deljiva stran ima dinamičen:
- `<title>`: npr. »{Panoga} v {Regija}: letna izguba €{znesek} | Lime Savings Calculator«
- `<meta name="description">`: povzetek izračuna + spodbuda k preizkusu.
- Open Graph meta značke, primerna og:image (generična slika kalkulatorja z logotipom).

Predvidena uporaba ISR: ob prvem zahtevku se stran zgenerira in shrani za prihodnje obiskovalce. Tako so vse kombinacije indeksirane brez vnaprejšnjega generiranja več tisoč strani.

### 6.4 Orodja in knjižnice
- Next.js (App Router)
- Framer Motion (ali CSS-animacije, če je potrebna manjša odvisnost)
- Tailwind CSS (če ga uporabljajo obstoječi Lime projekti) ali CSS moduli – skladno z obstoječo prakso
- react-hot-toast za obvestilo o kopiranju povezave
- Vercel Analytics (v sklopu gratis paketa)

### 6.5 Gostovanje in domena
- Gostovanje na Vercel (prosti paket, hobby).
- Domena: predlagamo `prihranek.limebooking.si` ali `savings.limebooking.si`.
- Okoljske spremenljivke (če potrebne za analitiko) definirane v Vercel.

## 7. Meritve uspešnosti (KPI)
Osnovno sledenje prek Vercel Analytics (ali Plausible):
- Število unikatnih obiskov.
- Povprečen čas na strani.
- Dogodek: »Klik na gumb Kopiraj povezavo«.
- Dogodek: »Klik na CTA – Preizkusi Lime Booking« (povezava na glavno spletno stran/naročnino).

Dodatno lahko uporabnikom omogočimo, da se iz kalkulatorja neposredno prijavijo na Lime Booking – ta konverzija se posebej označi.

## 8. Implementacijski načrt
1. Priprava podatkov (cene, cena Lime) v JSON obliki.
2. Postavitev projekta z Next.js, konfiguracija Vercel.
3. Implementacija uporabniškega vmesnika po korakih (izbira panoge, regije, vnos, prikaz).
4. Integracija URL parametrov in SSR za SEO.
5. Uporaba obstoječih Lime UI vzorcev (barve, komponente) iz mape `clave`.
6. Dodajanje animacij in mikrodetailov.
7. Testiranje odzivnosti na različnih napravah.
8. Vzpostavitev analitike in dogodkov.
9. Objava na testni domeni, nato produkcija.

## Clarifications
Q:
1. Kako točne morajo biti povprečne cene storitev po regijah in statistični podatki o zmanjšanju no-showov? Ali že imate pripravljene vire, ali naj podatke raziščemo in ocenimo sami? Kakšna je sprejemljiva mera napak pri ocenah?
2. Ali bo aplikacija izključno v slovenščini ali večjezična? Kategorije in regije ste zapisali v slovenščini, UI pa naj bi bil v istem jeziku? Ali so prevodi že na voljo ali naj implementiramo i18n?
3. Kje lahko dostopamo do obstoječih Lime aplikacij (lime-api-v2, Trial-pro, Trial-email, lime-chat-booking) – imamo na voljo skupno knjižnico komponent, oblikovne tokene ali le vizualne reference? Obstajajo stroge smernice blagovne znamke, ki jih moramo upoštevati?
4. Kako si predstavljate indeksiranje deljivih povezav: bomo generirali statične strani za vse možne kombinacije parametrov (lahko na tisoče) ali bomo uporabili dinamične URL parametre s strežniškim upodabljanjem? Katere meta informacije (naslov, opis, predogledna slika) naj bodo vključene za SEO?
5. Ali imate prednostne knjižnice za animacije (npr. Framer Motion) ali zadostujejo CSS prehodi? Kakšne so zahteve glede hitrosti nalaganja (npr. pod 2 sekundi na 3G omrežju)?
6. Kakšen je točen cenovni model Lime Booking, ki ga primerjamo s prihranki? Fiksna mesečna naročnina, paketi glede na velikost salona? Kako naj izračunamo točko preloma – enostavna delitev mesečne izgube z mesečnim stroškom Lime?
7. Kakšne so zahteve glede gostovanja: uporaba brezplačnega Vercel paketa, potreba po okoljskih spremenljivkah, lastna domena (npr. savings.limebooking.si)? Ali naj vključimo analitiko (Vercel Analytics, Plausible)?
8. Kako merimo uspeh tega orodja? So to obiski, čas na strani, konverzije v prijave na Lime Booking? Katere specifične KPI-je ali sledilne dogodke naj implementiramo?

A:
Priblizne cene, lahko tudi srbija in hrvaska, vse aplikacije so v clave mapi, vse glede lime poglej na splet

— Generated by Clave Remote Agent. Implementation plan: .clave/PLAN.md