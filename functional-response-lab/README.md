# Functional Response Lab

An ethical, browser-only practical for HAU Entomology. Students search for aphids on an artificial leaf and click to capture them. A compact handling bar leaves all aphids visible and prevents further capture until handling is complete. Students can therefore plan their next click while handling; this is a limitation of comparisons with models assuming exclusive searching and handling. A prey item counts only if its handling completes before the fixed deadline.

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
- Type I/II/III presets automatically set handling to 0/1/1 seconds respectively. Type I has no handling delay; Type II adds handling; Type III also applies a density-dependent capture probability. Type II/III handling can be adjusted. Presets leave the other chosen conditions unchanged; create a new experiment to apply changes to recorded trials.
- Type III uses p(N) = N/(N+K) per accurate click, where N is current prey and K defaults to 20 (adjustable). Failures neither consume prey nor start handling. Capture randomness is seeded independently of placement and replacement. This rule illustrates increasing efficiency with density; it is not a calibrated species or experience-based learning model, and no observed curve is guaranteed.
- Reference curves follow the selected mechanism. Type I uses zero handling. Type II uses Holling's disc equation for replacement and Rogers' random-predator equation for depletion. Type III replacement uses a(N) = aN/(N+K) in the disc equation. Depletion solves T = [ln(N0/Nf) + K(1/Nf − 1/N0)]/a + h(N0 − Nf) by bisection; it does not freeze capture efficiency at initial density.
- Optional dark mode remembers the local preference. It changes interface colours only, leaving the leaf and prey unchanged. Graph exports keep their white background for printing. Practical instructions and unrecorded practice are available on the Practical tab.
- One participant's repeats are technical trials, not independent biological replicates. Human skill, learning, fatigue, display and input device remain potential confounders.

## Files

- `index.html`: interface, teaching guidance, scientific references.
- `styles.css`: responsive light/dark design, artificial arena and handling progress bar.
- `model.js`: pure validation, randomisation, layouts, summaries, trial timing and reference equations.
- `app.js`: local experiment storage, game interactions, charts and downloads.
- `assets/`: three original generated raster teaching illustrations; all are schematic, not taxonomic references. Aphid images retain transparency. `harper-adams-logo.png` is the same university logo used by the HAU opportunities pages, reused from `entomology-hau/career_opportunities/site/assets/`.
- `tests/model.test.cjs`: timing and scientific-calculation checks, run with `node --test tests/model.test.cjs`.

## Data and analysis

Data remain in localStorage (`hau-functional-response-v1`) in the student's browser. Download before leaving a shared computer. There is no cross-device or class-wide database. CSV files include all recorded experiments; the graph selector keeps conditions separate. A fresh experiment preserves earlier recorded data. An unfinished older sequence is not automatically continued after a new experiment is created. Version 1.0 trials used a handling mask; they remain available in Results, with `handling_visibility=covered` in exports. A partly completed legacy sequence is archived when loaded to prevent mixing methods. Empty legacy sequences can use the new mechanics.

Trial CSV records app version, handling visibility, response preset, capture rule and K, experiment/group, aphid and predator context, handling and exposure times, prey treatment, distribution, target size, background, randomisation seeds, trial order, replicate block, initial prey, completed consumption, valid-target attempts, successful captures initiated, failed capture attempts, incomplete final handling, missed background clicks, handling and non-handling durations, arena pixel size, device pixel ratio, pointer type, UTC start time, completion timestamps and a JSON capture-attempt log (target, time, current prey, probability and success). Non-handling time includes any idle time after prey depletion; it is not a direct estimate of active biological search time. No-event trials have input type `none`. Replacement trials omit proportion consumed because consumed/initial prey can exceed one.

Comparisons should hold exposure time, prey replacement, device, zoom and target size constant unless these are the intended treatments. Exported charts are SVG. The orange reference curve is not a statistical fit; an appropriate functional-response analysis should account for depletion, count bounds and participant/block structure. Do not infer biological control effectiveness from human click performance.

## Published basis

1. Holling, C. S. (1959). Some characteristics of simple types of predation and parasitism. *The Canadian Entomologist*, 91, 385–398. https://doi.org/10.4039/Ent91385-7
2. Rogers, D. (1972). Random search and insect population models. *Journal of Animal Ecology*, 41, 369–383. https://doi.org/10.2307/3474
3. Kayahan, A. (2021). Functional response of Chrysoperla carnea on two different aphid species (Aphis fabae and Acyrthosiphon pisum). *International Journal of Agriculture, Environment and Food Sciences*, 5(4). https://dergipark.org.tr/en/pub/jaefs/article/976648
4. Predatory behavior of Coccinella septempunctata on two different aphid species via functional response at two different temperatures (2025). *Biology*, 14, 245. https://doi.org/10.3390/biology14030245
5. Ail-Catzim and colleagues (2019). Functional response of Chrysoperla carnea on Myzus persicae nymphs. *Proceedings of the Entomological Society of Washington*, 121, 535–543. https://doi.org/10.4289/0013-8797.121.4.535

6. Bruzzone, O. A. and colleagues (2022). Revisiting the influence of learning in predator functional response, how it can lead to shapes different from type III. *Ecology and Evolution*, 12, e8593. https://doi.org/10.1002/ece3.8593

Joe Roberts’ related teaching game (https://dr-joe-roberts.github.io/functional-responses/) was reviewed as inspiration for the presets and gameplay guidance. The implementation and explicit probability rule here are independent.

AHDB pages in the interface provide UK crop-pest context. No paper's biological parameters were silently converted into game seconds.

## Local use

Open `index.html` in a modern browser, or run `python3 -m http.server 8000` in this folder. Local storage behaviour on `file:` URLs varies; serving over HTTP is preferable. No external requests are needed to run the app. Scientific links open the original sources.

Version 1.1.0 · 8 October 2026.
