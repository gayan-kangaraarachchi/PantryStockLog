# Pantrylog

A phone-first shopping list and pantry stock tracker. It keeps track of what you have at home, adds things to your shopping list when they run low, and moves what you buy back into stock.

**Live app:** https://gayan-kangaraarachchi.github.io/PantryStockLog.io/

It's plain HTML, CSS and JavaScript, with no build step, no framework and no account to sign up for.

## Features

### Shopping list
- Add items with a quantity, unit (pcs, pack, kg, L and more) and category. Names you already have in stock are suggested as you type.
- The **category is picked automatically from the item name**, for example Chicken → Meat & fish, Milk → Dairy & eggs, Bananas → Produce. It understands common English, Finnish and Swedish names (kana, maito, kyckling, mjölk…). You can still change it, and items already in stock keep their own category.
- Items are grouped by category (Produce, Dairy & eggs, Bakery…) so the list follows the shop.
- Tick items as they go in the basket. A progress bar shows how much is done.
- **Complete list** adds every ticked item to stock. Items that aren't in stock yet are created automatically.
- Items you didn't tick move to a new list, so nothing is forgotten.
- You can keep more than one open list, and rename or delete a list.

### Stock
- Each item has a **slider** and **− / +** buttons to set how much you have.
- Each item has a **minimum** (shown as a marker on the slider) and a **target**.
- Colour shows the state at a glance: green means in stock, amber means low, red means out.
- Search the stock, and filter it by category or to show only low items.
- Start quickly with **Add 14 common staples**.
- **Export stock** saves all items to a JSON file. **Import stock** loads one and adds only the items that are missing (see below).

### Automatic refill
- When an item drops **below its minimum**, it's added to the open shopping list with enough to bring it back up to the target.
- If there's no open list, a new one is started.
- If you raise the stock back up before buying, the item is taken off the list again.

### History
- Every completed list is saved as a receipt, including items you didn't find.
- Shows trips and items bought this month, and the item you buy most often.
- **Shop this list again** copies a past list into your open list.

### Languages
- English (en-GB) is the default. Finnish (fi-FI) and Swedish (sv-SE) can be picked from the menu at the top right.
- The choice is remembered on each phone or browser.
- Buttons, messages, categories, units (kpl, st…), dates and decimal commas all follow the chosen language. The common staples are added with names in that language.
- Item and list names you type are kept as written. Categories and units are stored in English inside the data, so stock files can be exported and imported between languages.

### Mobile
- Works on any phone browser and can be added to the home screen as an app.
- Double-tapping and tapping into text boxes don't zoom the page.
- Supports light and dark mode.

## Install on your phone

| Phone | Steps |
| --- | --- |
| iPhone | Open the link in **Safari** → tap **Share** → **Add to Home Screen** |
| Android | Open the link in **Chrome** → tap **⋮** → **Add to Home screen** (or **Install app**) |

It then opens full-screen with the Pantrylog icon, like a normal app.

## Files

| File | What it holds |
| --- | --- |
| `index.html` | Page structure and styles |
| `app.js` | All app logic: storage, stock rules, lists, history |
| `manifest.webmanifest` | App name, colours and icons for "Add to Home Screen" |
| `icon.svg` | Browser tab icon |
| `icon-192.png`, `icon-512.png` | Android home screen icons |
| `apple-touch-icon.png` | iPhone home screen icon |
| `README.md` | This file |

Keep all of these files together in the root of the repo.

## Where your data is saved

| Where it runs | Where data is saved |
| --- | --- |
| GitHub Pages or a local file | In that browser only (`localStorage` keys `pantrylog.items` and `pantrylog.lists`) |
| As a claude.ai Artifact | A shared live database: everyone with access sees the same stock and lists |

On GitHub Pages, **each phone keeps its own data**, and it isn't shared between household members. Clearing the browser's site data deletes it. To share between phones, the save functions in `app.js` (the `Store` object) can be connected to a backend such as Firebase or Supabase.

## Export and import stock

At the bottom of the **Stock** tab:

- **Export stock** downloads `pantrylog-stock-YYYY-MM-DD.json` with every stock item (name, category, unit, quantity, minimum, target).
- **Import stock** reads that file and **adds only the items that are missing**, matched by name and ignoring capital letters. Items you already have keep their current quantity and settings. Imported items that are below their minimum go straight onto the shopping list.

Use it to back up your stock, or to move it to another phone: export on one phone, send the file, then import on the other.

```json
{
 "app": "pantrylog", "kind": "stock", "version": 1,
 "exportedAt": "2026-11-08T12:00:00.000Z",
 "items": [
  { "id": "i...", "name": "Milk", "cat": "Dairy & eggs", "unit": "L", "qty": 2, "min": 1, "target": 3, "createdAt": 1762600000000 }
 ]
}
```

## Run it

- **Locally:** open `index.html` in a browser.
- **GitHub Pages:**
  1. Push the files to the root of a **public** repository.
  2. Go to **Settings → Pages**, choose **Deploy from a branch**, then pick `main` and `/ (root)`, and save.
  3. Wait for **Actions → pages build and deployment** to show a green tick. The address appears in **Settings → Pages**.

## Update the app

1. In the repo, click **Add file → Upload files**.
2. Drag in the changed files and click **Commit changes**.
3. Pages redeploys in about a minute. If your phone still shows the old version, close the app or tab and open it again.

## Data model

```text
items/{id}  { id, name, cat, unit, qty, min, target, createdAt, updatedAt }

lists/{id}  { id, name, status: "open" | "completed",
              createdAt, completedAt?, updatedAt,
              lines:   [{ id, itemId, name, unit, qty, done, auto, cat }],
              missed?: [{ name, qty, unit }] }
```

- `auto: true` marks a line that was added because stock went below the minimum.
- `missed` holds the lines that weren't ticked when a list was completed. They're shown crossed out in History.

## Adding a language

All text is in the `T` object near the top of `app.js`, with one block per language (`en`, `fi`, `sv`).

1. Copy the `fi` block, give it a new code (for example `de`) and translate the values. Keep `{placeholders}` such as `{n}` and `{name}` as they are.
2. Add the language to `LANGS` with its locale, for example `de:{locale:"de-DE",idx:3}`.
3. Add an `<option value="de">Deutsch</option>` to the language menu in `index.html`.
4. Add the staple names in the new language to `STAPLES` (the `idx` picks the column).

## Tech

- Vanilla JavaScript, with no dependencies.
- Fonts from Google Fonts: Bricolage Grotesque, Figtree and IBM Plex Mono, with system fonts as fallbacks.
- Works in current versions of Safari, Chrome, Edge and Firefox.
