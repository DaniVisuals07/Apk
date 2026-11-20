# Kalkulator putarina za kamione

Web aplikacija: korisnik unese polazište, odredište i podatke o vozilu (vrsta, osovine, masa, visina, Euro klasa, tunelska kategorija), a aplikacija prikaže rutu za kamione, kilometražu i putarine po državama i po naplatnim tačkama.

## Struktura

```
index.html        # frontend (karta, forma, prikaz rezultata)
api/geocode.js    # Vercel serverless: pretraga lokacija
api/route.js      # Vercel serverless: truck ruta + putarine
```

## Postavljanje

1. Napravite besplatan nalog na https://platform.here.com i generišite **API key**
   (uključite Routing v8 i Geocoding & Search).
2. Postavite repozitorij na GitHub.
3. Na https://vercel.com izaberite *Add New → Project* i uvezite repozitorij.
4. U *Settings → Environment Variables* dodajte `HERE_API_KEY` = vaš ključ, pa uradite redeploy.

Lokalno testiranje: `npm i -g vercel`, zatim `vercel dev` u folderu projekta (sa `HERE_API_KEY` u `.env`).

## Važno o tačnosti

- Ključ ostaje na serveru (serverless funkcije), nikad u pregledniku.
- Aplikacija se ne može oslanjati na direktno čitanje web stranica operatera iz preglednika
  (CORS blokade, različiti formati, stranice se mijenjaju), pa se tarife uzimaju iz
  HERE baze putarina, koja pokriva putarine, tunele i mostove u većini evropskih država.
- Podaci se osvježavaju kod HERE-a, ne u realnom vremenu sa svake stranice operatera.
  Za stopostotnu pravnu/knjigovodstvenu sigurnost ključne dionice provjerite kod operatera
  (npr. ASFINAG, Toll Collect, HAC/ARZ, DARS, Magyar Közút, JP Putevi Srbije).
- Neke države naplaćuju po sistemu vinjete/vremenskog bloka ili po kilometru; rezultat zavisi od
  ispravnog unosa osovina, mase i Euro klase.
