# Pantrylog

A phone-first shopping list and pantry stock tracker in a single HTML file. No build step and no dependencies apart from Google Fonts.

## Features

- **Shopping list**: add items with a quantity and unit, then tick them off as they go in the basket.
- **Complete a list**: every ticked item is added to stock (new items are created automatically). Anything you didn't tick moves to a new list.
- **Stock**: each item has a slider and −/+ buttons, a minimum and a target.
- **Auto refill**: when stock drops below the minimum, the item is added to the open list, or a new list is started, with enough to reach the target. If you raise stock back up before buying, it comes off the list again.
- **History**: completed lists are kept as receipts, including items you didn't find. You can shop a past list again.

## Storage

| Where it runs | Where data is saved |
| --- | --- |
| As a claude.ai Artifact (with the `db` capability) | A shared live database: everyone with access sees the same stock and lists |
| Anywhere else (GitHub Pages, a local file) | `localStorage` in that browser only (keys `pantrylog.items`, `pantrylog.lists`) |

## Run it

Open `index.html` in a browser, or publish the repo with GitHub Pages:

1. Push this folder to a GitHub repository.
2. Go to **Settings → Pages**, choose **Deploy from a branch**, then pick `main` and `/ (root)`.
3. Open the URL that GitHub shows.

## Data model

```text
items/{id}  { id, name, cat, unit, qty, min, target, createdAt, updatedAt }
lists/{id}  { id, name, status: "open" | "completed", createdAt, completedAt?,
              lines: [{ id, itemId, name, unit, qty, done, auto, cat }],
              missed?: [{ name, qty, unit }] }
```
