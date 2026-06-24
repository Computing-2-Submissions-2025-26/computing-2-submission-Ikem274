import R from "./ramda.js";
import Imperium from "./Imperium.js";

// ============================================================
// Tile images mapping
// ============================================================
const TILE_IMAGES = {
    1: "Tiles/Student_Finance.svg", 2: "Tiles/Huxley.svg", 3: "Tiles/Bills_Due.svg",
    4: "Tiles/Westbound_Station.svg", 5: "Tiles/Blackett.svg", 6: "Tiles/Event_Card1.svg",
    7: "Tiles/Roderic_Hill.svg", 8: "Tiles/Gap_Year.svg", 9: "Tiles/Science_Museum.svg",
    10: "Tiles/Sir_Alexander_Fleming.svg", 11: "Tiles/Business_School.svg", 12: "Tiles/Event_Card2.svg",
    13: "Tiles/Acex_Workshop.svg", 14: "Tiles/Dyson_Building.svg", 15: "Tiles/Student_Union.svg",
    16: "Tiles/Sherfield_Walkway.svg", 17: "Tiles/Event_Card3.svg", 18: "Tiles/Abdus_Salam_Library.svg",
    19: "Tiles/Eastbound_Station.svg", 20: "Tiles/Hammersmith.svg", 21: "Tiles/Charing_Cross_Hospital.svg",
    22: "Tiles/Failed.svg", 23: "Tiles/White_city.svg", 24: "Tiles/History_Museum.svg",
    25: "Tiles/Queens_Tower.svg", 26: "Tiles/Event_Card4.svg", 27: "Tiles/Rent_Due.svg",
    28: "Tiles/Royal_Albert_Hall.svg"
};
const TILE_INFO = {
    2: "Tile_info/HuxleyRent.svg", 4: "Tile_info/WestboundRent.svg", 5: "Tile_info/BlackettRent.svg",
    7: "Tile_info/RodericRent.svg", 9: "Tile_info/ScienceMuseumRent.svg", 10: "Tile_info/FlemmingRent.svg",
    11: "Tile_info/BusinessRent.svg", 13: "Tile_info/AcexRent.svg", 14: "Tile_info/DysonRent.svg",
    16: "Tile_info/SherfieldRent.svg", 18: "Tile_info/AbdusRent.svg", 20: "Tile_info/HammersmithRent.svg",
    21: "Tile_info/CharingRent.svg", 23: "Tile_info/WhiteRent.svg", 25: "Tile_info/QueensRent.svg",
    28: "Tile_info/RoyalRent.svg"
};


// ============================================================
// State
// ============================================================
let gameState = null;
let selectedIcons = {}; // Maps player index to their chosen emoji

// ── UI Helpers ──────────────────────────────────────────────

/**
 * Convenience function to grab a DOM element by its ID.
 */
const getEl = (id) => document.getElementById(id);

/**
 * Filter function to get only players who haven't gone bankrupt.
 */
const getActivePlayers = R.filter(R.pipe(R.prop("isBankrupt"), R.not));

// ============================================================
// Setup Screen
// ============================================================

/**
 * Initialises the main home screen where players select how many are playing,
 * their names, and their icons.
 */
const initHomeScreen = () => {
    const grid = getEl("player-count-grid");
    const label = getEl("home-selected-label");
    const namesContainer = getEl("home-names");
    const startBtn = getEl("home-start-btn");
    const hint = getEl("home-money-hint");

    // Display how much money everyone starts with
    hint.innerHTML = `Each player starts with <strong>£${Imperium.starting_money.toLocaleString()}</strong>`;

    let playerCount = 0;

    // Create buttons for 2, 3, or 4 players
    const createPlayerCountButtons = R.forEach(n => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "count-btn";
        btn.textContent = n;

        btn.addEventListener("click", () => {
            // Highlight the clicked button
            grid.querySelectorAll(".count-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // Update UI to show the setup fields for 'n' players
            playerCount = n;
            label.textContent = `${n} players selected`;
            selectedIcons = {};
            buildPlayerSetups(n, namesContainer);
            validateHome(namesContainer, startBtn);
        });

        grid.appendChild(btn);
    });

    createPlayerCountButtons([2, 3, 4]);

    // Handle clicking the big "Start Game" button
    startBtn.addEventListener("click", () => {
        if (playerCount < 2) return;

        // Build the player objects based on what was typed/selected
        const createSetupPlayer = i => {
            const input = getEl(`player-name-${i}`);
            const name = (input && input.value.trim()) || `Player ${i + 1}`;
            const emoji = selectedIcons[i] || Imperium.icon_choices[i].emoji;
            const colour = Imperium.token_colours[i % Imperium.token_colours.length];
            return Imperium.create_player(i + 1, name, emoji, colour);
        };

        const players = R.times(createSetupPlayer, playerCount);
        launchGame(players);
    });
};

/**
 * Builds the name input and icon picker for each player.
 */
const buildPlayerSetups = (n, container) => {
    container.innerHTML = "";

    R.times(i => {
        const colour = Imperium.token_colours[i % Imperium.token_colours.length];

        const setupDiv = document.createElement("div");
        setupDiv.className = "home-player-setup";

        // Player Header (e.g. "Player 1")
        const header = document.createElement("div");
        header.className = "home-player-header";
        const dot = document.createElement("div");
        dot.className = "player-colour-dot";
        dot.style.backgroundColor = colour;
        const lbl = document.createElement("span");
        lbl.className = "home-player-label";
        lbl.textContent = `Player ${i + 1}`;
        header.append(dot, lbl);

        // Name Input
        const input = document.createElement("input");
        input.type = "text";
        input.className = "home-name-input";
        input.placeholder = `Player ${i + 1}`;
        input.maxLength = 20;
        input.id = `player-name-${i}`;
        input.addEventListener("input", () => validateHome(container, getEl("home-start-btn")));

        // Icon Picker
        const iconLabel = document.createElement("div");
        iconLabel.className = "icon-picker-label";
        iconLabel.textContent = "Choose your icon";

        const picker = document.createElement("div");
        picker.className = "icon-picker";
        picker.id = `icon-picker-${i}`;

        R.forEach(({ emoji }) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "icon-btn";
            btn.textContent = emoji;
            btn.dataset.emoji = emoji;

            btn.addEventListener("click", () => {
                selectedIcons[i] = emoji;
                refreshIconPickers(n);
                validateHome(container, getEl("home-start-btn"));
            });

            picker.appendChild(btn);
        }, Imperium.icon_choices);

        setupDiv.append(header, input, iconLabel, picker);
        container.appendChild(setupDiv);
    }, n);

    refreshIconPickers(n);
};

/**
 * Updates the icon pickers so you can't choose an emoji someone else already picked.
 */
const refreshIconPickers = (n) => {
    const takenEmojis = R.values(selectedIcons);

    R.times(i => {
        const picker = getEl(`icon-picker-${i}`);
        if (!picker) return;

        picker.querySelectorAll(".icon-btn").forEach(btn => {
            const emoji = btn.dataset.emoji;
            btn.classList.remove("selected", "taken");

            if (selectedIcons[i] === emoji) {
                btn.classList.add("selected");
            } else if (R.includes(emoji, takenEmojis) && selectedIcons[i] !== emoji) {
                btn.classList.add("taken");
            }
        });
    }, n);
};

/**
 * Enables or disables the Start button depending on if everyone is ready.
 */
const validateHome = (container, btn) => {
    const inputs = container.querySelectorAll(".home-name-input");
    const allHaveIcons = Object.keys(selectedIcons).length === inputs.length;
    btn.disabled = inputs.length === 0 || !allHaveIcons;
};

// ============================================================
// Game Launch
// ============================================================

/**
 * Transitions from the setup screen to the actual game board.
 * @param {Imperium.Player[]} players
 */
const launchGame = (players) => {
    // 1. Create the engine state
    gameState = Imperium.create_game_state(players);

    // 2. Swap screens
    getEl("home-screen").classList.add("hidden");
    getEl("game-screen").classList.remove("hidden");

    // 3. Render the board and UI
    loadTileImages();
    renderPlayerPanel();
    renderTokensOnBoard();
    renderOwnerIcons();
    renderUpgradeIndicators();
    updateActionButtons();
    attachTileClickHandlers();

    console.log("Game started!", gameState);
};

// ============================================================
// Board Rendering
// ============================================================

/**
 * Loads the background images onto the game board tiles.
 * @returns {void}
 */
const loadTileImages = () => {
    R.forEach(([id, imgPath]) => {
        const el = getEl(`tile-${id}`);
        if (el && imgPath) {
            el.style.backgroundImage = `url('./assets/${imgPath}')`;
        }
    }, R.toPairs(TILE_IMAGES));
};

/**
 * Makes every tile clickable so players can inspect property cards.
 */
const attachTileClickHandlers = () => {
    R.times(i => {
        const tileId = i + 1;
        const el = getEl(`tile-${tileId}`);
        const tileData = Imperium.get_tile_data(tileId);
        if (el && tileData && tileData.type === "property") {
            el.classList.add("interactable-tile");
            el.addEventListener("click", () => showPropertyInfo(tileId));
        }
    }, Imperium.total_tiles);
};

// ============================================================
// Dynamic Board Elements (Tokens, Icons, Houses)
// ============================================================

/**
 * Draws the player emojis on whatever tile they are currently standing on.
 * Grouping players by tile to prevent overlap, and styling visitors in the Gap Year differently.
 * @returns {void}
 */
const renderTokensOnBoard = () => {
    // Clear old tokens
    document.querySelectorAll(".tile-tokens").forEach(el => el.remove());
    if (!gameState) return;

    // Group active players by which tile position they are on
    const activePlayers = getActivePlayers(gameState.players);
    const playersByTile = R.groupBy(R.prop("position"), activePlayers);

    // Render each group of players onto their tile
    R.forEachObjIndexed((playersOnTile, tileId) => {
        const tileEl = getEl(`tile-${tileId}`);
        if (!tileEl) return;

        const container = document.createElement("div");

        // Special case: make tokens look different if they are just visiting the Gap Year tile
        const isVisitingGapYear = Number(tileId) === Imperium.gap_year_tile &&
            R.all(R.pipe(R.prop("inGapYear"), R.not), playersOnTile);

        container.className = "tile-tokens" + (isVisitingGapYear ? " tile-tokens--visiting" : "");

        // Add each player's emoji token
        R.forEach(player => {
            const token = document.createElement("div");
            token.className = "tile-token";
            token.style.backgroundColor = player.colour;
            token.title = player.name;
            token.textContent = player.emoji;
            container.appendChild(token);
        }, playersOnTile);

        tileEl.appendChild(container);
    }, playersByTile);
};

/**
 * Draws a small coloured badge on tiles to show who owns them.
 */
const renderOwnerIcons = () => {
    document.querySelectorAll(".tile-owner-icon").forEach(el => el.remove());
    if (!gameState) return;

    const activePlayers = getActivePlayers(gameState.players);

    R.forEach(player => {
        R.forEach(tileId => {
            const tileEl = getEl(`tile-${tileId}`);
            if (!tileEl) return;

            const icon = document.createElement("div");
            icon.className = "tile-owner-icon";
            icon.style.backgroundColor = player.colour;
            icon.textContent = player.emoji;
            tileEl.appendChild(icon);
        }, player.properties);
    }, activePlayers);
};

/**
 * Draws green blocks (houses) or red blocks (hotels) on upgraded properties.
 */
const renderUpgradeIndicators = () => {
    document.querySelectorAll(".tile-upgrade-indicator").forEach(el => el.remove());
    if (!gameState) return;

    R.forEachObjIndexed((level, tileId) => {
        if (level <= 0) return;

        const tileEl = getEl(`tile-${tileId}`);
        if (!tileEl) return;

        const indicator = document.createElement("div");
        indicator.className = "tile-upgrade-indicator";

        // Level 3 gets a big red hotel icon, others get green house icons
        if (level === 3) {
            indicator.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#e74c3c" stroke="#fff" stroke-width="2"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 7h2M9 11h2M9 15h2M13 7h2M13 11h2M13 15h2"></path></svg>`;
        } else {
            indicator.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="#2ecc71" stroke="#fff" stroke-width="2" style="margin:0 1px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>`.repeat(level);
        }
        tileEl.appendChild(indicator);
    }, gameState.propertyLevels);
};

// ============================================================
// Side Panel (Player Stats)
// ============================================================

/**
 * Updates the side panel that lists all players, their money, and their properties.
 */
const renderPlayerPanel = () => {
    if (!gameState) return;

    const panelPlayers = getEl("panel-players");
    const panelRound = getEl("panel-round");

    panelRound.textContent = `Round ${gameState.round}`;
    panelPlayers.innerHTML = "";

    const forEachIndexed = R.addIndex(R.forEach);

    forEachIndexed((player, index) => {
        const isTheirTurn = index === gameState.currentPlayerIndex;

        const card = document.createElement("div");
        card.className = `player-card${isTheirTurn ? " active" : ""}${player.isBankrupt ? " bankrupt" : ""}`;
        card.id = `player-card-${player.id}`;
        card.style.setProperty("--player-colour", player.colour);

        // Header: Emoji, Name, and "Your Turn" badge
        const header = document.createElement("div");
        header.className = "pc-header";
        header.innerHTML = `
            <div class="pc-avatar">${player.emoji}</div>
            <div class="pc-name">${player.name}</div>
            <div class="pc-turn-badge">Your Turn</div>
        `;

        // Money Display
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

        // Properties List
        const propsTitle = document.createElement("div");
        propsTitle.className = "pc-props-title";
        propsTitle.textContent = "Properties";

        const propsList = document.createElement("div");
        propsList.className = "pc-props-list";

        if (player.properties.length === 0) {
            propsList.innerHTML = `<span class="pc-props-empty">None yet</span>`;
        } else {
            // Render a chip for each property they own
            player.properties.forEach(tileId => {
                const data = Imperium.get_tile_data(tileId);
                const chip = document.createElement("div");
                chip.className = "prop-chip";
                chip.addEventListener("click", () => showPropertyInfo(tileId));

                const group = data && data.colourGroup ? Imperium.get_colour_group(data.colourGroup) : null;
                const dotColor = group ? group.colour : "var(--accent)";

                chip.innerHTML = `
                    <div class="prop-chip-dot" style="background: ${dotColor}"></div>
                    <span>${data ? data.name : `Tile ${tileId}`}</span>
                `;

                // Add a level badge if they've upgraded it
                const upgradeLevel = gameState.propertyLevels[tileId] || 0;
                if (upgradeLevel > 0) {
                    chip.innerHTML += `<div class="prop-chip-level">L${upgradeLevel}</div>`;
                }

                propsList.appendChild(chip);
            });
        }

        card.append(header, money, divider, propsTitle, propsList);
        panelPlayers.appendChild(card);
    }, gameState.players);
};

// ============================================================
// Action Buttons Logic
// ============================================================

/**
 * Determines which buttons (Roll, Buy, Upgrade, End Turn, etc.)
 * should be visible to the player at this exact moment.
 */
const updateActionButtons = () => {
    if (!gameState) return;

    const player = Imperium.current_player(gameState);

    const btnRoll = getEl("btn-roll");
    const btnBuy = getEl("btn-buy");
    const btnUpgrade = getEl("btn-upgrade");
    const btnSellUpgrade = getEl("btn-sell-upgrade");
    const btnEnd = getEl("btn-end-turn");
    const btnDeclareBankruptcy = getEl("btn-declare-bankruptcy");
    const btnPayGapYear = getEl("btn-pay-gap-year");
    const btnRollGapYear = getEl("btn-roll-gap-year");

    // Hide everything initially
    const allButtons = [btnRoll, btnBuy, btnUpgrade, btnSellUpgrade, btnEnd, btnDeclareBankruptcy, btnPayGapYear, btnRollGapYear];
    R.forEach(b => b.classList.add("hidden"), allButtons);

    if (gameState.phase === "game_over" || player.isBankrupt) return;

    // --- GAP YEAR LOGIC ---
    if (player.inGapYear) {
        btnPayGapYear.classList.remove("hidden");
        btnRollGapYear.classList.remove("hidden");

        // Only allow paying the buyout fee if they have enough money
        btnRollGapYear.disabled = false;
        btnPayGapYear.disabled = player.money < Imperium.gap_year_buyout;
        return;
    }

    // --- START OF TURN LOGIC ---
    if (gameState.phase === "roll" && !gameState.hasRolled) {
        btnRoll.classList.remove("hidden");
        btnRoll.disabled = false;
    }

    // --- LANDED ON TILE LOGIC ---
    if (gameState.phase === "landed") {
        btnEnd.classList.remove("hidden");

        const tile = Imperium.get_tile_data(player.position);

        if (tile && Imperium.is_property(player.position)) {
            const owner = Imperium.find_owner(gameState, player.position);

            if (!owner && player.money >= tile.price) {
                // Property is unowned, and they can afford it
                btnBuy.classList.remove("hidden");

            } else if (owner && owner.id === player.id) {
                // They own it, check if they can upgrade or sell upgrades
                const ownerIndex = gameState.players.indexOf(owner);
                const ownsFullSet = Imperium.owns_full_set(gameState, ownerIndex, tile.colourGroup);
                const level = gameState.propertyLevels[player.position] || 0;

                if (ownsFullSet && tile.upgradeCost && level < 3) {
                    btnUpgrade.classList.remove("hidden");
                    btnUpgrade.textContent = `Upgrade — £${tile.upgradeCost}`;
                }

                if (level > 0 && tile.sellPrice) {
                    btnSellUpgrade.classList.remove("hidden");
                    btnSellUpgrade.textContent = `Downgrade — +£${tile.sellPrice}`;
                }
            }
        }
    }

    // --- BANKRUPTCY LOGIC ---
    if (player.money < 0 && !player.isBankrupt) {
        btnDeclareBankruptcy.classList.remove("hidden");
        // Force them to resolve their debt or declare bankruptcy
        btnEnd.classList.add("hidden");
    }
};

// ============================================================
// Animations
// ============================================================

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Rolls the dice rapidly before landing on the final value.
 * @param {number} finalValue
 * @returns {Promise<void>}
 */
const animateDice = (finalValue) => {
    return new Promise(resolve => {
        const die = getEl("die-face");
        die.textContent = "?";
        die.classList.add("rolling");

        let flicks = 0;
        const interval = setInterval(() => {
            die.textContent = Math.floor(Math.random() * 6) + 1;
            flicks++;
            if (flicks >= 10) {
                clearInterval(interval);
                die.textContent = finalValue;
                die.classList.remove("rolling");
                resolve();
            }
        }, 60);
    });
};

/**
 * Makes the player token hop tile by tile to its destination.
 * @param {number} steps
 * @returns {Promise<void>}
 */
const animateMovement = async (steps) => {
    const player = Imperium.current_player(gameState);
    let tempPos = player.position;

    for (let i = 0; i < steps; i++) {
        tempPos = tempPos + 1;
        if (tempPos > Imperium.total_tiles) tempPos = 1;

        // Temporarily adjust position in state purely for the visual re-render
        const updatePosition = R.over(R.lensProp("position"), R.always(tempPos));
        gameState = R.over(
            R.lensProp("players"),
            R.adjust(gameState.currentPlayerIndex, updatePosition),
            gameState
        );

        renderTokensOnBoard();
        await sleep(200);
    }
};

// ============================================================
// Central Landing Hub
// ============================================================

/**
 * Called right after a player lands on a new tile.
 * It passes the game state into the Engine (Imperium.js), gets the new state,
 * and figures out what message/UI to show the user.
 */
const handleLandingUI = () => {
    const { state, action } = Imperium.handle_landing(gameState);
    gameState = state;

    // React to whatever the engine said happened
    switch (action.type) {
        case "property_unowned":
            showPropertyCard(action.tileId, false);
            break;
        case "property_owned_self":
            showPropertyCard(action.tileId, true);
            break;
        case "property_owned_other":
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
        case "go_to_gap_year":
            showToast("You Fail! Go to Gap Year!", "lose");
            break;
        case "gap_year_visiting":
            showToast("Just visiting Gap Year", "info");
            break;
        case "free_parking":
            showToast("Free Parking — relax!", "info");
            break;
    }

    // After resolving the tile, check if anyone won
    gameState = Imperium.check_winner(gameState);
    if (gameState.phase === "game_over") {
        showWinScreen(gameState.winner);
    }

    // Refresh the UI to reflect new money/property balances
    renderPlayerPanel();
    renderTokensOnBoard();
    renderOwnerIcons();
    renderUpgradeIndicators();
    updateActionButtons();
};

// ============================================================
// Modals
// ============================================================

/**
 * Opens the modal dialog with the given HTML content.
 * @param {string} html
 * @param {boolean} transparent
 */
const openModal = (html, transparent = false) => {
    const overlay = getEl("modal-overlay");
    const content = getEl("modal-content");
    content.innerHTML = html;

    if (transparent) {
        content.classList.add("modal-content--transparent");
    } else {
        content.classList.remove("modal-content--transparent");
    }

    overlay.classList.remove("hidden");
};

const closeModal = () => {
    getEl("modal-overlay").classList.add("hidden");
};

/**
 * Pops up a detailed card for a specific property.
 * @param {number} tileId

 * @param {boolean} infoOnly
 */
const showPropertyCard = (tileId, infoOnly = false) => {
    const tile = Imperium.get_tile_data(tileId);
    if (!tile) return;

    const owner = Imperium.find_owner(gameState, tileId);
    const player = Imperium.current_player(gameState);

    let canBuy = false;
    if (!infoOnly && !owner && Imperium.is_property(tileId) && player.money >= tile.price) {
        canBuy = true;
    }

    // Build the SVG info card view
    let imageContent = TILE_INFO[tileId]
        ? `<img src="./assets/${TILE_INFO[tileId]}" alt="${tile.name}" class="prop-card-img" />`
        : `<div class="prop-card-fallback">No Info Card Available</div>`;

    let html = `
    <div class="prop-card-image-container">
        ${imageContent}
    </div>
    <div style="text-align: center; display: flex; justify-content: center; gap: 10px;">
        ${canBuy ? `<button class="action-btn action-btn--buy" id="modal-buy" style="margin-top: 10px; width: 140px; box-shadow: 0 4px 15px rgba(0,0,0,0.4);">Buy — £${tile.price}</button>` : ""}
        <button class="action-btn action-btn--end" id="modal-close" style="margin-top: 10px; width: 140px; box-shadow: 0 4px 15px rgba(0,0,0,0.4);">Close</button>
    </div>`;

    openModal(html, true);

    // Wire up the dynamic buttons
    getEl("modal-close").addEventListener("click", closeModal);

    if (canBuy) {
        getEl("modal-buy").addEventListener("click", () => {
            gameState = Imperium.buy_property(gameState);
            showToast(`Bought ${tile.name} for £${tile.price}!`, "gain");
            closeModal();
            renderPlayerPanel();
            renderOwnerIcons();
            updateActionButtons();
        });
    }
};

/** Quick wrapper to show property info when clicked on the board. */
const showPropertyInfo = (tileId) => {
    const tile = Imperium.get_tile_data(tileId);
    // Ignore non-properties
    if (!tile || ["event", "go", "tax", "go_to_gap_year", "free_parking"].includes(tile.type)) return;

    showPropertyCard(tileId, true);
};

/** Shows a fun modal when an Event Card is drawn. */
const showEventCard = (card) => {
    const effect = card.effect;
    const isGain = effect.type === "gain" || effect.type === "move";

    let effectText = "";
    if (effect.type === "gain") effectText = `+£${effect.amount}`;
    else if (effect.type === "lose") effectText = `-£${effect.amount}`;
    else {
        const tileName = Imperium.get_tile_data(effect.tileId)?.name || `Tile ${effect.tileId}`;
        effectText = `Move to ${tileName}`;
    }

    const html = `
        <div class="event-card-modal">
            <div class="event-card-top">
                <div class="event-card-subtitle">Event Card</div>
                <h3>${card.title}</h3>
            </div>
            <div class="event-card-body">
                <p>${card.description}</p>
                <div class="event-card-effect ${isGain ? "gain" : "lose"}">${effectText}</div>
                <button class="action-btn action-btn--end" id="modal-close" style="width:100%">OK</button>
            </div>
        </div>
    `;

    openModal(html);

    getEl("modal-close").addEventListener("click", () => {
        closeModal();
        if (effect.type === "move") {
            // Re-render and trigger a landing effect since they were moved
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
// Toasts
// ============================================================

/**
 * Shows a quick fading notification at the bottom.
 * @param {string} message
 * @param {string} [type="info"]
 */
const showToast = (message, type = "info") => {
    const container = getEl("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
};

// ============================================================
// Wiring Action Buttons to Logic
// ============================================================

const wireButtons = () => {

    // 🎲 ROLL DICE
    getEl("btn-roll").addEventListener("click", async () => {
        getEl("btn-roll").disabled = true;

        // 1. Roll in state
        gameState = Imperium.roll_dice(gameState);
        const rolledValue = gameState.lastDiceValue;

        // 2. Play dice animation
        await animateDice(rolledValue);

        // 3. Play hopping animation
        const playerBefore = Imperium.current_player(gameState);
        await animateMovement(rolledValue);

        // 4. Do the real move in state (calculates GO money)
        const revertPosition = R.over(R.lensProp("position"), R.always(playerBefore.position));
        gameState = R.over(
            R.lensProp("players"),
            R.adjust(gameState.currentPlayerIndex, revertPosition),
            gameState
        );
        gameState = Imperium.move_player(gameState, rolledValue);

        renderTokensOnBoard();
        renderPlayerPanel();
        handleLandingUI();
    });

    // 💰 BUY PROPERTY
    getEl("btn-buy").addEventListener("click", () => {
        const player = Imperium.current_player(gameState);
        const tile = Imperium.get_tile_data(player.position);

        gameState = Imperium.buy_property(gameState);
        if (tile) showToast(`Bought ${tile.name} for £${tile.price}!`, "gain");

        renderPlayerPanel();
        renderOwnerIcons();
        updateActionButtons();
    });

    // Upgrade Degree
    getEl("btn-upgrade").addEventListener("click", () => {
        const player = Imperium.current_player(gameState);
        const tile = Imperium.get_tile_data(player.position);
        if (!tile) return;

        const levelBefore = gameState.propertyLevels[player.position] || 0;
        gameState = Imperium.upgrade_property(gameState, player.position);
        const levelAfter = gameState.propertyLevels[player.position] || 0;

        if (levelAfter > levelBefore) {
            showToast(`Upgraded ${tile.name} to ${levelAfter}!`, "gain");
        }
        renderPlayerPanel();
        renderUpgradeIndicators();
        updateActionButtons();
    });

    // Downgrade Degree
    getEl("btn-sell-upgrade").addEventListener("click", () => {
        const player = Imperium.current_player(gameState);
        const tile = Imperium.get_tile_data(player.position);
        if (!tile) return;

        gameState = Imperium.sell_property_upgrade(gameState, player.position);
        showToast(`Downgrade on ${tile.name}!`, "gain");

        renderPlayerPanel();
        renderUpgradeIndicators();
        updateActionButtons();
    });

    // ⏭️ END TURN
    getEl("btn-end-turn").addEventListener("click", () => {
        gameState = Imperium.end_turn(gameState);
        getEl("die-face").textContent = "?";

        renderPlayerPanel();
        renderTokensOnBoard();
        updateActionButtons();

        // Let them know if the next player is stuck in Gap Year
        const nextPlayer = Imperium.current_player(gameState);
        if (nextPlayer.inGapYear) {
            showToast(`${nextPlayer.name} is in Gap Year!`, "info");
        }
    });

    // Declare Bankruptcy
    getEl("btn-declare-bankruptcy").addEventListener("click", () => {
        const player = Imperium.current_player(gameState);

        gameState = Imperium.declare_bankruptcy(gameState, gameState.currentPlayerIndex);
        showToast(`${player.name} has declared bankruptcy!`, "lose");

        // Skip their turn and check if game ended
        gameState = Imperium.end_turn(gameState);
        gameState = Imperium.check_winner(gameState);

        if (gameState.phase === "game_over") {
            showWinScreen(gameState.winner);
        }

        renderPlayerPanel();
        renderTokensOnBoard();
        renderOwnerIcons();
        updateActionButtons();
    });

    // Pay gap year buyout
    getEl("btn-pay-gap-year").addEventListener("click", () => {
        const player = Imperium.current_player(gameState);

        if (player.money < Imperium.gap_year_buyout) {
            showToast("Not enough money to buy out!", "lose");
            return;
        }

        const result = Imperium.handle_gap_year_turn(gameState, "pay");
        gameState = result.state;

        showToast("Paid £50 buyout — you're free!", "lose");
        renderPlayerPanel();
        renderTokensOnBoard();
        updateActionButtons();
    });

    // Roll to escape Gap year
    getEl("btn-roll-gap-year").addEventListener("click", async () => {
        getEl("btn-roll-gap-year").disabled = true;
        getEl("btn-pay-gap-year").disabled = true;

        const result = Imperium.handle_gap_year_turn(gameState, "roll");
        gameState = result.state;

        await animateDice(result.diceValue);

        if (result.escaped) {
            showToast(`Rolled a ${result.diceValue} — you're free!`, "gain");
            if (result.diceValue === Imperium.gap_year_escape_number) {
                renderTokensOnBoard();
                renderPlayerPanel();
                handleLandingUI();
                return;
            }
            gameState = Imperium.end_turn(gameState);
        } else {
            showToast(`Rolled a ${result.diceValue} — need a ${Imperium.gap_year_escape_number}. Turn missed.`, "lose");
            gameState = Imperium.end_turn(gameState);
        }

        getEl("die-face").textContent = "?";
        renderPlayerPanel();
        renderTokensOnBoard();
        updateActionButtons();
    });

    // ❌ MODAL BACKGROUND CLICK
    getEl("modal-overlay").addEventListener("click", (e) => {
        if (e.target.id === "modal-overlay") closeModal();
    });
};

// ============================================================
// Game Over
// ============================================================

/**
 * Shows the win screen with the winner's details.
 * @param {Imperium.Player|null} winner
 */
const showWinScreen = (winner) => {
    const screen = getEl("win-screen");
    getEl("win-emoji").textContent = winner ? winner.emoji : "🏆";
    getEl("win-name").textContent = winner ? `${winner.name} Wins!` : "Game Over!";
    getEl("win-money").textContent = winner ? `Final Balance: £${winner.money.toLocaleString()}` : "";
    screen.classList.remove("hidden");
};

// ============================================================
// Boot Sequence
// ============================================================

window.addEventListener("DOMContentLoaded", () => {
    console.log("Imperium UI Initialised — using Imperium.js");
    initHomeScreen();
    wireButtons();
});