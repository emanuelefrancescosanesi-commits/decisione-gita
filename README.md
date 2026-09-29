# Meta della gita

Pagina per scegliere la meta della gita di classe: ogni compagno sceglie i paesi UE su una mappa (o li scrive) e l'organizzatore vede mappa colorata, classifica e chi ha scelto cosa. Nessun account e nessuna installazione per i compagni.

## Pubblicare la pagina (una volta)

1. Su GitHub: **Settings → Pages**.
2. **Source**: Deploy from a branch. **Branch**: `claude/meta-gita-app`, cartella `/docs`. Salva.
3. Dopo circa un minuto la pagina è su `https://emanuelefrancescosanesi-commits.github.io/decisione-gita/`.

## Usarla

1. Apri l'indirizzo della pagina dal PC dell'organizzatore, vai su **Risultati** e premi **Attiva la raccolta online**.
2. Premi **Mostra il QR per la classe** (o **Copia il link**) e fai inquadrare il codice ai compagni.
3. Resta sulla scheda Risultati: le scelte compaiono da sole.

Le scelte passano da ntfy.sh, che le conserva 12 ore. La pagina ne salva una copia nel browser dell'organizzatore a ogni aggiornamento: usa sempre lo stesso browser e aprila almeno una volta ogni 12 ore.

## Struttura

- `src/standalone.html`: pagina per i compagni e l'organizzatore (sorgente).
- `src/app.html`: versione per l'Artifact di claude.ai (salvataggio condiviso, richiede account).
- `scripts/build.mjs`: genera `docs/index.html` e `index.html`, con la mappa UE calcolata da Natural Earth.
- Ricostruire: `npm install && npm run build`.
