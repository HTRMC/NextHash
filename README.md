# NextHash

[![Next.js](https://img.shields.io/badge/next.js-15.0.3-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/react-19.0.0--rc-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/typescript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bcrypt](https://img.shields.io/badge/bcrypt-2.4.3-003A70?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/bcryptjs)
[![Zod](https://img.shields.io/badge/zod-3.23.8-3E67B1?style=for-the-badge&logo=zod&logoColor=white)](https://www.npmjs.com/package/zod)

Een beveiligde authenticatie applicatie gebouwd met Next.js, React, en bcrypt voor wachtwoordhashing.

## Beveiligingsvragen

### Kun je het oorspronkelijke wachtwoord uit de hash achterhalen?
Nee, het is niet mogelijk om het oorspronkelijke wachtwoord uit de bcrypt hash te achterhalen. Bcrypt is een one-way hashing functie, wat betekent dat het proces niet omkeerbaar is. Dit is een belangrijk beveiligingsprincipe: zelfs als een aanvaller toegang krijgt tot de database, kunnen ze de originele wachtwoorden niet achterhalen.

### Maakt bcrypt gebruik van een salt?
Ja, bcrypt maakt automatisch gebruik van een salt. In onze implementatie gebruiken we `bcrypt.hash(password, 10)` waarbij:
- De salt automatisch wordt gegenereerd door bcrypt
- Het getal 10 de "cost factor" is (aantal rounds)
- De gegenereerde salt wordt opgeslagen als deel van de hash
- Het formaat is: `$2a$10$[22 karakters salt][31 karakters hash]`

Dit betekent dat zelfs als twee gebruikers hetzelfde wachtwoord hebben, hun hashes verschillend zullen zijn vanwege de unieke salt.

## Foutafhandeling

Het programma bevat uitgebreide foutafhandeling:

1. API Validatie:
   - Content-type verificatie
   - JSON parsing validatie
   - Schema validatie met Zod
   - Specifieke error messages per validatiefout

2. Database Operaties:
   - Automatische database initialisatie
   - Foutafhandeling bij lezen/schrijven
   - Herstel bij corrupte JSON data

3. Gebruikersfeedback:
   - Duidelijke foutmeldingen in de UI
   - Laadstatus indicatie
   - Form validatie feedback

## Installatie

1. Clone het project:
```bash
git clone [repository-url]
cd nexthash
npm run build
npm run start
