# Flatpay · Pitch Trainer

Ein moderner Gesprächs-Generator, mit dem du deinen Flatpay-Pitch wie ein echtes
Telefon-/Türgespräch übst – Phase für Phase, jedes Mal neu gewürfelt.

UI-Aufbau im Stil von Duolingo (Fortschrittsleiste über 5 Phasen,
Weiter-Flow, Gratulations-Screens), gestylt im minimalistischen
Schwarz-Weiß-Design von Flatpay mit ruhigen Glas-Flächen (angelehnt an die
Apple-Intelligence- & Gemini-Ästhetik). Statt Eule oder Gemini-Stern feiert
dich das **Flatpay-Logo** als animierte Komponente.

## Konzept

- **Zufälliger Verlauf:** Mal triffst du den **Inhaber**, mal eine:n
  **Mitarbeiter:in** – auch der aktuelle **Anbieter** (Payone, Sparkasse, SumUp,
  TeleCash, Vert, Nexi …) wird pro Gespräch neu gewürfelt.
- **5 Phasen:** Begrüßung → Interesse → Anbieter → Einwand → Abschluss.
- **Aufdecken-Modus:** Dein Gegenüber sagt etwas, du überlegst deine Antwort und
  deckst dann die ideale Flatpay-Antwort in der unteren Hälfte auf.
- **Gratulation:** Nach jeder Phase pulst die Flatpay-Mark als Belohnung.

Die kompletten Antworten/Einwände stammen 1:1 aus dem Pitch-Skript und liegen in
[`src/data.ts`](src/data.ts) – dort lässt sich der Inhalt leicht erweitern.

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
