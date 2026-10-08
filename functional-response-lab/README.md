# Functional Response Lab

An ethical, browser-only practical for HAU Entomology. Students search for aphids on an artificial leaf and click to capture them. Handling conceals the arena and prevents further capture. A prey item counts only if its handling completes before the fixed deadline.

Published as a self-contained subdirectory of `entomology-hau/aphidsim`, at `functional-response-lab/`. It has no build, package installation, external runtime libraries, backend, analytics or authentication. All paths are relative, so the folder can also be hosted independently on GitHub Pages.

## Teaching design

- Default: 5, 10, 20, 40 and 80 aphids; three blocks; 20 seconds per trial; 1 second handling. Five minutes of active trials plus breaks and discussion.
- Every density occurs once per replicate block in a seeded random order. Each attempted trial gets a new recorded layout seed.
- Three UK aphids: Myzus persicae, Aphis fabae and Acyrthosiphon pisum.
- Predator contexts: fourth-instar Coccinella septempunctata and third-instar Chrysoperla carnea group.
- Both predator labels deliberately have the same initial handling time. There is no unsupported species performance ranking. Game seconds are teaching settings, not measured or rescaled biological parameters.
- Prey removal or immediate replacement after completed handling; scattered or clustered distributions; two levels of leaf-vein contrast; standard or large targets.
- A fixed 900 × 540 logical arena scales to the viewport. Non-overlapping points come from a jittered grid; clustered placement ranks available points by distance from three seeded centres. The prey positions are therefore controlled teaching layouts, not real aphid aggregations or a continuous Poisson point process.
- Practice is unrecorded. Tab hiding, leaving the page or resizing during a trial discards that attempt. Time does not stop when all prey have been consumed.
- Raw replicates, density means and ±1 SE; SE undefined for one observation. Model overlays are optional theoretical examples, never fits. A visual line between means does not diagnose response type.
- Type II reference: Holling's disc equation for replacement and a numerical solution of Rogers' random-predator equation for depletion. Type I and III are explained, not imposed.
- One participant's repeats are technical trials, not independent biological replicates. Human skill, learning, fatigue, display and input device remain potential confounders.

## Files

- `index.html`: interface, teaching guidance, scientific references.
- `styles.css`: responsive design, artificial arena and handling mask.
- `model.js`: pure validation, randomisation, layouts, summaries, trial timing and reference equations.
- `app.js`: local experiment storage, game interactions, charts and downloads.
- `assets/`: three original generated raster teaching illustrations; all are schematic, not taxonomic references. Aphid images retain transparency.
- `tests/model.test.cjs`: timing and scientific-calculation checks, run with `node --test tests/model.test.cjs`.

## Data and analysis

Data remain in localStorage (`hau-functional-response-v1`) in the student's browser. Download before leaving a shared computer. There is no cross-device or class-wide database. CSV files include all recorded experiments; the graph selector keeps conditions separate. A fresh experiment preserves earlier recorded data. An unfinished older sequence is not automatically continued after a new experiment is created.

Trial CSV records experiment/group, aphid and predator context, handling and exposure times, prey treatment, distribution, target size, background, randomisation seeds, trial order, replicate block, initial prey, completed consumption, attacks initiated, incomplete final handling, missed clicks, handling and non-handling durations, arena pixel size, device pixel ratio, pointer type, UTC start time and completion timestamps. Non-handling time includes any idle time after prey depletion; it is not a direct estimate of active biological search time. No-event trials have input type `none`. Replacement trials omit proportion consumed because consumed/initial prey can exceed one.

Comparisons should hold exposure time, prey replacement, device, zoom and target size constant unless these are the intended treatments. Exported charts are SVG. The orange reference curve is not a statistical fit; an appropriate functional-response analysis should account for depletion, count bounds and participant/block structure. Do not infer biological control effectiveness from human click performance.

## Published basis

1. Holling, C. S. (1959). Some characteristics of simple types of predation and parasitism. *The Canadian Entomologist*, 91, 385–398. https://doi.org/10.4039/Ent91385-7
2. Rogers, D. (1972). Random search and insect population models. *Journal of Animal Ecology*, 41, 369–383. https://doi.org/10.2307/3474
3. Kayahan, A. (2021). Functional response of Chrysoperla carnea on two different aphid species (Aphis fabae and Acyrthosiphon pisum). *International Journal of Agriculture, Environment and Food Sciences*, 5(4). https://dergipark.org.tr/en/pub/jaefs/article/976648
4. Predatory behavior of Coccinella septempunctata on two different aphid species via functional response at two different temperatures (2025). *Biology*, 14, 245. https://doi.org/10.3390/biology14030245
5. Ail-Catzim and colleagues (2019). Functional response of Chrysoperla carnea on Myzus persicae nymphs. *Proceedings of the Entomological Society of Washington*, 121, 535–543. https://doi.org/10.4289/0013-8797.121.4.535

AHDB pages in the interface provide UK crop-pest context. No paper's biological parameters were silently converted into game seconds.

## Local use

Open `index.html` in a modern browser, or run `python3 -m http.server 8000` in this folder. Local storage behaviour on `file:` URLs varies; serving over HTTP is preferable. No external requests are needed to run the app. Scientific links open the original sources.

Version 1.0.0 · 8 October 2026.
