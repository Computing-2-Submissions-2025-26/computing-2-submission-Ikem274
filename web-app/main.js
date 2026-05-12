import R from "./ramda.js";
import GameLogic from "./Game/GameLogic.js";
import Api from "./Game/api.js";


// ── Tile images ─────────────────────────────────────────────
const TILE_IMAGES = {
    1: "Tiles/Student_Finance.svg", 2: "Tiles/Huxley.svg", 3: "Tiles/Bills_Due.svg",
    4: "Tiles/Westbound_Station.svg", 5: "Tiles/Blackett.svg", 6: "Tiles/Event_Card1.svg",
    7: "Tiles/Roderic_Hill.svg", 8: "Tiles/Gap_Year.svg", 9: "Tiles/Science_Museum.svg",
    10: "Tiles/Sir_Alexander_Fleming.svg", 11: "Tiles/Business_School.svg", 12: "Tiles/Event_Card2.svg",
    13: "Tiles/Acex_Workshop.svg", 14: "Tiles/Dyson_Building.svg", 15: "Tiles/free_parking.svg",
    16: "Tiles/Sherfield_Walkway.svg", 17: "Tiles/Event_Card3.svg", 18: "Tiles/Abdus_Salam_Library.svg",
    19: "Tiles/Eastbound_Station.svg", 20: "Tiles/Hammersmith.svg", 21: "Tiles/Charing_Cross_Hospital.svg",
    22: "Tiles/Failed.svg", 23: "Tiles/White_city.svg", 24: "Tiles/History_Museum.svg",
    25: "Tiles/Queens_Tower.svg", 26: "Tiles/Event_Card4.svg", 27: "Tiles/Rent_Due.svg",
    28: "Tiles/Royal_Albert_Hall.svg"
};

// ── State ───────────────────────────────────────────────────
let gameState = null;
let selectedIcons = {}; // playerIndex → emoji

// ============================================================
//  HOME SCREEN
// ============================================================
const initHomeScreen = () => {
    const grid = document.getElementById("player-count-grid");
    const label = document.getElementById("home-selected-label");
    const names = document.getElementById("home-names");
    const startBtn = document.getElementById("home-start-btn");
    const hint = document.getElementById("home-money-hint");

    hint.innerHTML = `Each player starts with <strong>£${GameLogic.STARTING_MONEY.toLocaleString()}</strong>`;

    let count = 0;

    [2, 3, 4, 5, 6].forEach(n => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "count-btn";
        btn.id = `count-btn-${n}`;
        btn.textContent = n;
        btn.addEventListener("click", () => {
            grid.querySelectorAll(".count-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            count = n;
            label.textContent = `${n} players selected`;
            selectedIcons = {};
            buildPlayerSetups(n, names);
            validateHome(names, startBtn);
        });
        grid.appendChild(btn);
    });

    startBtn.addEventListener("click", () => {
        if (count < 2) return;
        const players = [];
        for (let i = 0; i < count; i++) {
            const input = document.getElementById(`player-name-${i}`);
            const name = (input && input.value.trim()) || `Player ${i + 1}`;
            const emoji = selectedIcons[i] || GameLogic.ICON_CHOICES[i].emoji;
            const colour = GameLogic.TOKEN_COLOURS[i % GameLogic.TOKEN_COLOURS.length];
            players.push(GameLogic.createPlayer(i + 1, name, emoji, colour));
        }
        launchGame(players);
    });
};

const buildPlayerSetups = (n, container) => {
    container.innerHTML = "";
    for (let i = 0; i < n; i++) {
        const colour = GameLogic.TOKEN_COLOURS[i % GameLogic.TOKEN_COLOURS.length];
        const setup = document.createElement("div");
        setup.className = "home-player-setup";

        const header = document.createElement("div");
        header.className = "home-player-header";
        const dot = document.createElement("div");
        dot.className = "player-colour-dot";
        dot.style.backgroundColor = colour;
        dot.style.color = colour;
        const lbl = document.createElement("span");
        lbl.className = "home-player-label";
        lbl.textContent = `Player ${i + 1}`;
        header.append(dot, lbl);

        const input = document.createElement("input");
        input.type = "text";
        input.className = "home-name-input";
        input.placeholder = `Player ${i + 1}`;
        input.maxLength = 20;
        input.id = `player-name-${i}`;
        input.addEventListener("input", () => validateHome(container, document.getElementById("home-start-btn")));

        const iconLabel = document.createElement("div");
        iconLabel.className = "icon-picker-label";
        iconLabel.textContent = "Choose your icon";

        const picker = document.createElement("div");
        picker.className = "icon-picker";
        picker.id = `icon-picker-${i}`;

        GameLogic.ICON_CHOICES.forEach(({ emoji }) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "icon-btn";
            btn.textContent = emoji;
            btn.dataset.emoji = emoji;
            btn.addEventListener("click", () => {
                selectedIcons[i] = emoji;
                refreshIconPickers(n);
                validateHome(container, document.getElementById("home-start-btn"));
            });
            picker.appendChild(btn);
        });

        setup.append(header, input, iconLabel, picker);
        container.appendChild(setup);
    }
    refreshIconPickers(n);
};

const refreshIconPickers = (n) => {
    const taken = Object.values(selectedIcons);
    for (let i = 0; i < n; i++) {
        const picker = document.getElementById(`icon-picker-${i}`);
        if (!picker) continue;
        picker.querySelectorAll(".icon-btn").forEach(btn => {
            const em = btn.dataset.emoji;
            btn.classList.remove("selected", "taken");
            if (selectedIcons[i] === em) {
                btn.classList.add("selected");
            } else if (taken.includes(em) && selectedIcons[i] !== em) {
                btn.classList.add("taken");
            }
        });
    }
};

const validateHome = (container, btn) => {
    const inputs = container.querySelectorAll(".home-name-input");
    const allHaveIcons = Object.keys(selectedIcons).length === inputs.length;
    btn.disabled = inputs.length === 0 || !allHaveIcons;
};

// ============================================================
//  GAME LAUNCH
// ============================================================
const launchGame = (players) => {
    gameState = GameLogic.createGameState(players);
    document.getElementById("home-screen").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");

    loadTileImages();
    renderPlayerPanel();
    renderTokensOnBoard();
    renderOwnerIcons();
    renderUpgradeIndicators();
    updateActionButtons();
    attachTileClickHandlers();

    console.log("Imperium started!", gameState);
};

// ============================================================
//  BOARD
// ============================================================
const loadTileImages = () => {
    Object.entries(TILE_IMAGES).forEach(([id, img]) => {
        const el = document.getElementById(`tile-${id}`);
        if (el && img) el.style.backgroundImage = `url('./assets/${img}')`;
    });
};

const attachTileClickHandlers = () => {
    for (let i = 1; i <= GameLogic.TOTAL_TILES; i++) {
        const el = document.getElementById(`tile-${i}`);
        if (!el) continue;
        el.addEventListener("click", () => showPropertyInfo(i));
    }
};

// ============================================================
//  TOKENS ON BOARD
// ============================================================
const renderTokensOnBoard = () => {
    document.querySelectorAll(".tile-tokens").forEach(el => el.remove());
    if (!gameState) return;

    const byTile = {};
    gameState.players.forEach(p => {
        if (p.isBankrupt) return;
        if (!byTile[p.position]) byTile[p.position] = [];
        byTile[p.position].push(p);
    });

    Object.entries(byTile).forEach(([tid, pls]) => {
        const tileEl = document.getElementById(`tile-${tid}`);
        if (!tileEl) return;
        const c = document.createElement("div");
        // Gap Year tile (8): visiting players go top-right, jailed stay centred
        const visiting = Number(tid) === GameLogic.GAP_YEAR_TILE && pls.every(p => !p.inJail);
        const jailed = Number(tid) === GameLogic.GAP_YEAR_TILE && pls.some(p => p.inJail);
        c.className = "tile-tokens" + (visiting ? " tile-tokens--visiting" : "");
        pls.forEach(p => {
            const t = document.createElement("div");
            t.className = "tile-token";
            t.style.backgroundColor = p.colour;
            t.title = p.name;
            t.textContent = p.emoji;
            c.appendChild(t);
        });
        tileEl.appendChild(c);
    });
};

// ============================================================
//  OWNER ICONS ON TILES
// ============================================================
const renderOwnerIcons = () => {
    document.querySelectorAll(".tile-owner-icon").forEach(el => el.remove());
    if (!gameState) return;

    gameState.players.forEach(p => {
        if (p.isBankrupt) return;
        p.properties.forEach(tid => {
            const tileEl = document.getElementById(`tile-${tid}`);
            if (!tileEl) return;
            const icon = document.createElement("div");
            icon.className = "tile-owner-icon";
            icon.style.backgroundColor = p.colour;
            icon.textContent = p.emoji;
            tileEl.appendChild(icon);
        });
    });
};

// ============================================================
//  UPGRADE INDICATORS ON TILES (houses / hotel)
// ============================================================
const renderUpgradeIndicators = () => {
    document.querySelectorAll(".tile-upgrade-indicator").forEach(el => el.remove());
    if (!gameState) return;

    Object.entries(gameState.propertyLevels).forEach(([tid, level]) => {
        if (level <= 0) return;
        const tileEl = document.getElementById(`tile-${tid}`);
        if (!tileEl) return;
        const ind = document.createElement("div");
        ind.className = "tile-upgrade-indicator";
        if (level === 3) {
            ind.textContent = "🏨";
        } else {
            ind.textContent = "🏠".repeat(level);
        }
        tileEl.appendChild(ind);
    });
};

// ============================================================
//  PLAYER PANEL
// ============================================================
const renderPlayerPanel = () => {
    if (!gameState) return;
    const pp = document.getElementById("panel-players");
    const pr = document.getElementById("panel-round");
    pr.textContent = `Round ${gameState.round}`;
    pp.innerHTML = "";

    gameState.players.forEach((player, idx) => {
        const isActive = idx === gameState.currentPlayerIndex;
        const card = document.createElement("div");
        card.className = `player-card${isActive ? " active" : ""}${player.isBankrupt ? " bankrupt" : ""}`;
        card.id = `player-card-${player.id}`;
        card.style.setProperty("--player-colour", player.colour);

        const header = document.createElement("div");
        header.className = "pc-header";
        const avatar = document.createElement("div");
        avatar.className = "pc-avatar";
        avatar.textContent = player.emoji;
        const name = document.createElement("div");
        name.className = "pc-name";
        name.textContent = player.name;
        const badge = document.createElement("div");
        badge.className = "pc-turn-badge";
        badge.textContent = "Your Turn";
        header.append(avatar, name, badge);

        const money = document.createElement("div");
        money.className = "pc-money";
        if (player.money < 0) {
            money.classList.add("pc-money--negative");
            money.textContent = `-£${Math.abs(player.money).toLocaleString()}`;
        } else {
            money.textContent = `£${player.money.toLocaleString()}`;
        }

        const divider = document.createElement("div");
        divider.className = "pc-divider";

        const propsTitle = document.createElement("div");
        propsTitle.className = "pc-props-title";
        propsTitle.textContent = "Properties";

        const propsList = document.createElement("div");
        propsList.className = "pc-props-list";

        if (player.properties.length === 0) {
            const empty = document.createElement("span");
            empty.className = "pc-props-empty";
            empty.textContent = "None yet";
            propsList.appendChild(empty);
        } else {
            player.properties.forEach(tid => {
                const data = GameLogic.getTileData(tid);
                const chip = document.createElement("div");
                chip.className = "prop-chip";
                chip.addEventListener("click", () => showPropertyInfo(tid));
                const d = document.createElement("div");
                d.className = "prop-chip-dot";
                const grp = data && data.colourGroup ? GameLogic.getColourGroup(data.colourGroup) : null;
                d.style.background = grp ? grp.colour : "var(--accent)";
                const s = document.createElement("span");
                s.textContent = data ? data.name : `Tile ${tid}`;
                chip.append(d, s);

                const level = gameState.propertyLevels[tid] || 0;
                if (level > 0) {
                    const lvlBadge = document.createElement("div");
                    lvlBadge.className = "prop-chip-level";
                    lvlBadge.textContent = "L" + level;
                    chip.appendChild(lvlBadge);
                }

                propsList.appendChild(chip);
            });
        }

        card.append(header, money, divider, propsTitle, propsList);

        // Declare Bankruptcy button for negative money players
        if (player.money < 0 && !player.isBankrupt) {
            const bankruptBtn = document.createElement("button");
            bankruptBtn.className = "action-btn action-btn--bankrupt";
            bankruptBtn.textContent = "Declare Bankruptcy";
            bankruptBtn.addEventListener("click", () => {
                gameState = Api.declareBankruptcy(gameState, idx);
                gameState = Api.checkWinner(gameState);
                if (gameState.phase === "game_over") {
                    showWinScreen(gameState.winner);
                }
                renderPlayerPanel();
                renderTokensOnBoard();
                renderOwnerIcons();
                updateActionButtons();
            });
            card.appendChild(bankruptBtn);
        }

        pp.appendChild(card);
    });
};

// ============================================================
//  ACTION BUTTONS
// ============================================================
const updateActionButtons = () => {
    if (!gameState) return;
    const player = Api.currentPlayer(gameState);
    const btnRoll = document.getElementById("btn-roll");
    const btnBuy = document.getElementById("btn-buy");
    const btnUpgrade = document.getElementById("btn-upgrade");
    const btnEnd = document.getElementById("btn-end-turn");
    const btnPayJail = document.getElementById("btn-pay-jail");
    const btnRollJail = document.getElementById("btn-roll-jail");

    // Hide all first
    [btnRoll, btnBuy, btnUpgrade, btnEnd, btnPayJail, btnRollJail].forEach(b => b.classList.add("hidden"));

    if (gameState.phase === "game_over") return;

    // Bankrupt players can't do anything
    if (player.isBankrupt) return;

    if (player.inJail) {
        btnPayJail.classList.remove("hidden");
        btnRollJail.classList.remove("hidden");
        if (player.money < GameLogic.GAP_YEAR_BUYOUT) btnPayJail.disabled = true;
        else btnPayJail.disabled = false;
        return;
    }

    if (gameState.phase === "roll" && !gameState.hasRolled) {
        btnRoll.classList.remove("hidden");
        btnRoll.disabled = false;
    }

    if (gameState.phase === "landed") {
        btnEnd.classList.remove("hidden");
        const tile = GameLogic.getTileData(player.position);
        if (tile && GameLogic.isProperty(player.position)) {
            const owner = Api.findOwner(gameState, player.position);
            if (!owner && player.money >= tile.price) {
                btnBuy.classList.remove("hidden");
            } else if (owner && owner.id === player.id) {
                const ownerIndex = gameState.players.indexOf(owner);
                const ownsSet = Api.ownsFullSet(gameState, ownerIndex, tile.colourGroup);
                const level = gameState.propertyLevels[player.position] || 0;
                if (ownsSet && tile.upgradeCost && level < 3 && player.money >= tile.upgradeCost) {
                    btnUpgrade.classList.remove("hidden");
                    btnUpgrade.textContent = `Buy House — £${tile.upgradeCost}`;
                }
            }
        }
    }
};

// ============================================================
//  DICE ROLLING
// ============================================================
const animateDice = (value) => {
    return new Promise(resolve => {
        const die = document.getElementById("die-face");
        die.textContent = "?";
        die.classList.add("rolling");

        let flicks = 0;
        const interval = setInterval(() => {
            die.textContent = Math.floor(Math.random() * 6) + 1;
            flicks++;
            if (flicks >= 10) {
                clearInterval(interval);
                die.textContent = value;
                die.classList.remove("rolling");
                resolve();
            }
        }, 60);
    });
};

// ============================================================
//  PLAYER MOVEMENT ANIMATION
// ============================================================
const animateMovement = async (steps) => {
    const player = Api.currentPlayer(gameState);
    let pos = player.position;

    for (let i = 0; i < steps; i++) {
        pos = pos + 1;
        if (pos > GameLogic.TOTAL_TILES) pos = 1;

        // Temporarily update position for visual
        gameState = {
            ...gameState,
            players: gameState.players.map((p, idx) =>
                idx === gameState.currentPlayerIndex ? { ...p, position: pos } : p
            )
        };
        renderTokensOnBoard();
        await sleep(200);
    }
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ============================================================
//  LANDING HANDLER
// ============================================================
const handleLandingUI = () => {
    const { state, action } = Api.handleLanding(gameState);
    gameState = state;

    switch (action.type) {
        case "property_unowned":
            showPropertyCard(action.tileId, false);
            break;
        case "property_owned_self":
            showPropertyCard(action.tileId, true);
            break;
        case "property_owned_other":
            showPropertyCard(action.tileId, true);
            showToast(`Paid £${action.rentAmount} rent to ${action.owner.name}`, "lose");
            break;
        case "event":
            showEventCard(action.card);
            break;
        case "tax":
            showToast(`${action.tileName}: Lost £${action.amount}`, "lose");
            break;
        case "go":
            showToast("Landed on Student Finance! Collected £200", "gain");
            break;
        case "go_to_jail":
            showToast("You Fail! Go to Gap Year!", "lose");
            break;
        case "jail_visiting":
            showToast("Just visiting Gap Year", "info");
            break;
        case "free_parking":
            showToast("Free Parking — relax!", "info");
            break;
        default:
            break;
    }

    gameState = Api.checkWinner(gameState);
    if (gameState.phase === "game_over") {
        showWinScreen(gameState.winner);
    }
    renderPlayerPanel();
    renderTokensOnBoard();
    renderOwnerIcons();
    renderUpgradeIndicators();
    updateActionButtons();
};

// ============================================================
//  PROPERTY CARD MODAL
// ============================================================
const showPropertyCard = (tileId, infoOnly) => {
    const tile = GameLogic.getTileData(tileId);
    if (!tile) return;

    const grp = tile.colourGroup ? GameLogic.getColourGroup(tile.colourGroup) : null;
    const headerColour = grp ? grp.colour : "#555";
    const owner = Api.findOwner(gameState, tileId);
    const player = Api.currentPlayer(gameState);

    const ownerIndex = owner ? gameState.players.indexOf(owner) : -1;
    const isCurrentPlayerOwner = ownerIndex === gameState.currentPlayerIndex;
    const level = gameState.propertyLevels[tileId] || 0;
    const ownsSet = ownerIndex !== -1 ? Api.ownsFullSet(gameState, ownerIndex, tile.colourGroup) : false;

    let html = `<div class="prop-card-image-container" style="text-align: center; margin-bottom: 1rem; margin-top: 1rem;">`;
    // We use an inline SVG as a robust placeholder so you can easily swap it out for a real info card later.
    html += `
    <svg width="300" height="450" viewBox="0 0 300 450" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.3);">
        <rect width="300" height="450" fill="${headerColour}" />
        <rect x="12" y="12" width="276" height="426" fill="#ffffff" rx="6" />
        <rect x="12" y="12" width="276" height="100" fill="${headerColour}" rx="6" />
        <text x="150" y="65" font-family="Inter, sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${tile.name}</text>
        <text x="150" y="190" font-family="Inter, sans-serif" font-size="20" font-weight="700" fill="#2c3e50" text-anchor="middle">SVG Placeholder</text>
        <circle cx="150" cy="250" r="30" fill="${headerColour}" opacity="0.2" />
        <text x="150" y="320" font-family="Inter, sans-serif" font-size="12" fill="#7f8c8d" text-anchor="middle">Click to swap later with:</text>
        <text x="150" y="340" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#e74c3c" text-anchor="middle">assets/Cards/${tileId}.svg</text>
    </svg>`;
    html += `</div>`;

    if (owner) {
        html += `<div class="prop-card-owner" style="text-align: center; margin-bottom: 1rem; font-size: 1.1rem;">Owned by <strong>${owner.name}</strong></div>`;
    }

    // Action buttons
    html += `<div class="prop-card-actions">`;
    if (!infoOnly && !owner && GameLogic.isProperty(tileId) && player.money >= tile.price) {
        html += `<button class="action-btn action-btn--buy" id="modal-buy">Buy — £${tile.price}</button>`;
    } else if (isCurrentPlayerOwner && ownsSet && tile.upgradeCost && level < 3 && player.money >= tile.upgradeCost) {
        html += `<button class="action-btn action-btn--buy" id="modal-upgrade">Upgrade — £${tile.upgradeCost}</button>`;
    }
    html += `<button class="action-btn action-btn--end" id="modal-close">Close</button>`;
    html += `</div>`;

    openModal(html);

    document.getElementById("modal-close").addEventListener("click", closeModal);
    const buyBtn = document.getElementById("modal-buy");
    if (buyBtn) {
        buyBtn.addEventListener("click", () => {
            gameState = Api.buyProperty(gameState);
            showToast(`Bought ${tile.name} for £${tile.price}!`, "gain");
            closeModal();
            renderPlayerPanel();
            renderOwnerIcons();
            updateActionButtons();
        });
    }
    const upgradeBtn = document.getElementById("modal-upgrade");
    if (upgradeBtn) {
        upgradeBtn.addEventListener("click", () => {
            gameState = Api.upgradeProperty(gameState, tileId);
            showToast(`Upgraded ${tile.name} to Level ${level + 1}!`, "gain");
            closeModal();
            renderPlayerPanel();
            renderUpgradeIndicators();
            updateActionButtons();
        });
    }
};

/** Show property info when clicking a tile (info only, no buy) */
const showPropertyInfo = (tileId) => {
    const tile = GameLogic.getTileData(tileId);
    if (!tile || tile.type === "event" || tile.type === "go" || tile.type === "jail" || tile.type === "go_to_jail" || tile.type === "free_parking") return;
    if (tile.type === "tax") return;
    showPropertyCard(tileId, true);
};

// ============================================================
//  EVENT CARD MODAL
// ============================================================
const showEventCard = (card) => {
    const eff = card.effect;
    const isGain = eff.type === "gain" || eff.type === "move";
    const tileName = eff.tileId ? (GameLogic.getTileData(eff.tileId)?.name || `Tile ${eff.tileId}`) : "";
    const effectText = eff.type === "gain" ? `+£${eff.amount}`
        : eff.type === "lose" ? `-£${eff.amount}`
            : `Move to ${tileName}`;

    let html = `<div class="event-card-modal">`;
    html += `<div class="event-card-top"><div class="event-card-subtitle">Event Card</div><h3>${card.title}</h3></div>`;
    html += `<div class="event-card-body">`;
    html += `<p>${card.description}</p>`;
    html += `<div class="event-card-effect ${isGain ? "gain" : "lose"}">${effectText}</div>`;
    html += `<button class="action-btn action-btn--end" id="modal-close" style="width:100%">OK</button>`;
    html += `</div></div>`;

    openModal(html);
    document.getElementById("modal-close").addEventListener("click", () => {
        closeModal();
        // If the event card moved the player, trigger the tile landing effect
        if (eff.type === "move") {
            renderTokensOnBoard();
            renderPlayerPanel();
            handleLandingUI();
        } else {
            renderPlayerPanel();
            renderTokensOnBoard();
            updateActionButtons();
        }
    });
};

// ============================================================
//  MODAL HELPERS
// ============================================================
const openModal = (html) => {
    const overlay = document.getElementById("modal-overlay");
    const content = document.getElementById("modal-content");
    content.innerHTML = html;
    overlay.classList.remove("hidden");
};

const closeModal = () => {
    document.getElementById("modal-overlay").classList.add("hidden");
};

// ============================================================
//  TOAST NOTIFICATIONS
// ============================================================
const showToast = (message, type = "info") => {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
};

// ============================================================
//  BUTTON EVENT WIRING
// ============================================================
const wireButtons = () => {
    // Roll Dice
    document.getElementById("btn-roll").addEventListener("click", async () => {
        const btnRoll = document.getElementById("btn-roll");
        btnRoll.disabled = true;

        gameState = Api.rollDice(gameState);
        const value = gameState.lastDiceValue;
        await animateDice(value);

        // Move player step by step
        const playerBefore = Api.currentPlayer(gameState);
        await animateMovement(value);

        // Now do the "real" move in state (handles GO salary)
        gameState = {
            ...gameState,
            players: gameState.players.map((p, i) =>
                i === gameState.currentPlayerIndex
                    ? { ...p, position: playerBefore.position }
                    : p
            )
        };
        gameState = Api.movePlayer(gameState, value);

        renderTokensOnBoard();
        renderPlayerPanel();
        handleLandingUI();
    });

    // Buy Property
    document.getElementById("btn-buy").addEventListener("click", () => {
        const player = Api.currentPlayer(gameState);
        const tile = GameLogic.getTileData(player.position);
        gameState = Api.buyProperty(gameState);
        if (tile) showToast(`Bought ${tile.name} for £${tile.price}!`, "gain");
        renderPlayerPanel();
        renderOwnerIcons();
        updateActionButtons();
    });

    // Buy House (Upgrade)
    document.getElementById("btn-upgrade").addEventListener("click", () => {
        const player = Api.currentPlayer(gameState);
        const tile = GameLogic.getTileData(player.position);
        if (!tile) return;
        const levelBefore = gameState.propertyLevels[player.position] || 0;
        gameState = Api.upgradeProperty(gameState, player.position);
        const levelAfter = gameState.propertyLevels[player.position] || 0;
        if (levelAfter > levelBefore) {
            showToast(`Upgraded ${tile.name} to Level ${levelAfter}!`, "gain");
        }
        renderPlayerPanel();
        renderUpgradeIndicators();
        updateActionButtons();
    });

    // End Turn
    document.getElementById("btn-end-turn").addEventListener("click", () => {
        gameState = Api.endTurn(gameState);
        document.getElementById("die-face").textContent = "?";
        renderPlayerPanel();
        renderTokensOnBoard();
        updateActionButtons();

        // Check if next player is in jail
        const next = Api.currentPlayer(gameState);
        if (next.inJail) {
            showToast(`${next.name} is in Gap Year!`, "info");
        }
    });

    // Pay Jail Buyout
    document.getElementById("btn-pay-jail").addEventListener("click", () => {
        const player = Api.currentPlayer(gameState);
        if (player.money < GameLogic.GAP_YEAR_BUYOUT) {
            showToast("Not enough money to buy out!", "lose");
            return;
        }
        const result = Api.handleJailTurn(gameState, "pay");
        gameState = result.state;
        showToast("Paid £50 buyout — you're free!", "lose");
        renderPlayerPanel();
        renderTokensOnBoard();
        updateActionButtons();
    });

    // Roll to Escape Jail
    document.getElementById("btn-roll-jail").addEventListener("click", async () => {
        const btnRJ = document.getElementById("btn-roll-jail");
        const btnPJ = document.getElementById("btn-pay-jail");
        btnRJ.disabled = true;
        btnPJ.disabled = true;

        const result = Api.handleJailTurn(gameState, "roll");
        gameState = result.state;

        await animateDice(result.diceValue);

        if (result.escaped) {
            showToast(`Rolled a ${result.diceValue} — you're free!`, "gain");
            if (result.diceValue === GameLogic.GAP_YEAR_ESCAPE_NUMBER) {
                // They moved, handle landing
                renderTokensOnBoard();
                renderPlayerPanel();
                handleLandingUI();
                return;
            }
            // Released after missing a turn — just end turn
            gameState = Api.endTurn(gameState);
        } else {
            showToast(`Rolled a ${result.diceValue} — need a ${GameLogic.GAP_YEAR_ESCAPE_NUMBER}. Turn missed.`, "lose");
            gameState = Api.endTurn(gameState);
        }

        document.getElementById("die-face").textContent = "?";
        renderPlayerPanel();
        renderTokensOnBoard();
        updateActionButtons();
    });

    // Modal overlay click to close
    document.getElementById("modal-overlay").addEventListener("click", (e) => {
        if (e.target.id === "modal-overlay") closeModal();
    });
};

// ============================================================
//  WIN SCREEN
// ============================================================
const showWinScreen = (winner) => {
    const screen = document.getElementById("win-screen");
    const emoji = document.getElementById("win-emoji");
    const name = document.getElementById("win-name");
    const money = document.getElementById("win-money");
    emoji.textContent = winner ? winner.emoji : "🏆";
    name.textContent = winner ? `${winner.name} Wins!` : "Game Over!";
    money.textContent = winner ? `Final Balance: £${winner.money.toLocaleString()}` : "";
    screen.classList.remove("hidden");
};

// ============================================================
//  BOOT
// ============================================================
window.addEventListener("DOMContentLoaded", () => {
    console.log("Imperium 8x8 — UI Initialised");
    initHomeScreen();
    wireButtons();
});