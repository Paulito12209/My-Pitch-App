# Flatpay · Pitch Trainer

Ein moderner Gesprächs-Generator, mit dem du deinen Flatpay-Pitch wie ein echtes
Telefon-/Türgespräch übst – Phase für Phase, jedes Mal neu gewürfelt.

UI-Aufbau im Stil von Duolingo (Fortschrittsleiste über 5 Phasen,
Weiter-Flow, Gratulations-Screens), gestylt im minimalistischen
Schwarz-Weiß-Design von Flatpay mit ruhigen Glas-Flächen (angelehnt an die
Apple-Intelligence- & Gemini-Ästhetik). Statt Eule oder Gemini-Stern feiert
dich das **Flatpay-Logo** als animierte Komponente.

## Zwei Modi

Nach dem Onboarding wählst du auf dem Startbildschirm einen Modus:

- **🎮 Simulation** – ein komplettes Gespräch frei durchspielen und üben
  (zufälliger Kunde, zufälliger Anbieter, Aufdecken-Modus). Siehe unten.
- **📞 Begleitmodus** – Live-Hilfe beim *echten* Anruf: ein navigierbarer
  Skript-Guide. Du liest, was du sagst, tippst dich über Karten durch die
  Reaktionen des Gegenübers (nach Wahrscheinlichkeit sortiert) und passt deine
  Sätze jederzeit über das **✏️-Icon** an (lokal gespeichert). Der **Weiter**-Button
  blendet sich beim Scrollen aus, damit du verdeckte Optionen siehst, und kommt
  im Stillstand zurück. Der Gesprächsbaum liegt in
  [`src/companion.ts`](src/companion.ts).

## Konzept (Simulation)

Jedes Gespräch ist ein **logisch aufgebauter Trichter** über 5 Phasen – mit
mehreren Teilschritten pro Phase, damit du den Ablauf wirklich trainierst und
nicht nur einzelne Sätze:

1. **Begrüßung** – Entscheider erreichen (verzweigt: Inhaber direkt vs.
   Mitarbeiter:in als Gatekeeper → Durchstellen).
2. **Kontaktieren** – Erstwiderstand auflösen **und** den aktuellen Anbieter
   erfragen (2 Schritte).
3. **Informieren** – die **3 Pflichtfragen**: Inhaber bestätigen · tippt ihr die
   Beträge manuell ins Gerät? · Umsatz pro Monat? (3 Schritte).
4. **Argumentieren** – **Zusammenfassen (Ja-Kette)** + Pain des Anbieters +
   sanfter Interesse-Check, ohne Widerstand zu erzeugen (2 Schritte).
5. **Terminieren** – erst Zustimmung holen, **dann** den konkreten Tag
   vorschlagen – kein vorschnelles „Dienstag oder Donnerstag" (2 Schritte).

- **Zufällig & frisch:** Rolle (Inhaber/Mitarbeiter:in), **Anbieter** (Payone,
  Sparkasse, SumUp, TeleCash, Vert, Nexi), Erstwiderstand, Umsatz und Einwände
  werden pro Gespräch neu gewürfelt.
- **Aufdecken-Modus:** Dein Gegenüber sagt etwas, du überlegst deine Antwort und
  deckst dann die ideale Flatpay-Antwort auf – inkl. kurzem **Technik-Hinweis**.
- **Fortschritt:** Die obere Leiste füllt jede Phase anteilig über ihre
  Teilschritte; nach jeder Phase feiert dich die Flatpay-Mark.

Der komplette Gesprächsverlauf liegt in [`src/data.ts`](src/data.ts) – dort
lassen sich Antworten, Varianten und Anbieter leicht erweitern.

## Lokal starten

```bash
npm install
npm run dev
```

Dann die angezeigte URL (Standard: <http://localhost:5173>) öffnen – auf dem
Handy am besten im selben WLAN über die Netzwerk-Adresse.

## Build

```bash
npm run build      # erzeugt dist/
npm run preview    # Vorschau des Builds
```

## Auf Vercel deployen

Das Projekt ist Vercel-ready (`vercel.json`, Framework-Preset **Vite**):

1. Repository auf GitHub pushen.
2. Auf [vercel.com](https://vercel.com) → **Add New Project** → dieses Repo
   importieren.
3. Vercel erkennt Vite automatisch (Build: `npm run build`, Output: `dist`).
   **Deploy** klicken – fertig.

Alternativ per CLI:

```bash
npm i -g vercel
vercel        # Vorschau-Deploy
vercel --prod # Produktiv-Deploy
```

## Tech-Stack

React 18 · TypeScript · Vite 5 – keine UI-Bibliothek, reines CSS-Design-System
in [`src/styles.css`](src/styles.css).
