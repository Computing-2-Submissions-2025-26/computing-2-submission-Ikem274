// ============================================================
// api.js — Game actions (pure state transforms, return new state)
// ============================================================
import GameLogic from "./GameLogic.js";

const {
    TOTAL_TILES, GAP_YEAR_TILE, GO_TO_GAP_YEAR_TILE,
    GO_SALARY, GAP_YEAR_BUYOUT, GAP_YEAR_ESCAPE_NUMBER,
    PROPERTY_DATA, getTileData, isProperty
} = GameLogic;

// ── Helpers ──────────────────────────────────────────────────

const updatePlayer = (state, index, updates) => ({
    ...state,
    players: state.players.map((p, i) =>
        i === index ? { ...p, ...updates } : p
    )
});


const currentPlayer = (state) => state.players[state.currentPlayerIndex];


/** Count how many stations a player owns */
const countStations = (state, playerIndex) =>
    state.players[playerIndex].properties.filter(
        (tid) => PROPERTY_DATA[tid] && PROPERTY_DATA[tid].type === "station"
    ).length;

/** Count how many museums a player owns */
const countMuseums = (state, playerIndex) =>
    state.players[playerIndex].properties.filter(
        (tid) => PROPERTY_DATA[tid] && PROPERTY_DATA[tid].colourGroup === "Museums"
    ).length;

/** Check if player owns all properties of a specific colour group */
const ownsFullSet = (state, playerIndex, colourGroup) => {
    if (!colourGroup || colourGroup === "station" || colourGroup === "Museums") return false;
    const player = state.players[playerIndex];
    const groupTiles = Object.keys(PROPERTY_DATA).filter(
        id => PROPERTY_DATA[id].colourGroup === colourGroup
    );
    return groupTiles.every(id => player.properties.includes(Number(id)));
};


// ── Actions ──────────────────────────────────────────────────

/** Roll a single die (1–6) */
const rollDice = function (state) {
    const diceValue = Math.floor(Math.random() * 6) + 1;
    return { ...state, lastDiceValue: diceValue, hasRolled: true };
};



/**
 * Move current player forward `steps` tiles.
 * Awards GO salary if passing tile 1 (not on firstMove).
 */
const movePlayer = function (state, steps) {
    const player = currentPlayer(state);
    let pos = player.position;
    let money = player.money;
    let passedGo = false;

    for (let i = 0; i < steps; i++) {
        pos += 1;
        if (pos > TOTAL_TILES) {
            pos = 1;
            passedGo = true;
        }
    }

    if (passedGo && !state.firstMove) {
        money += GO_SALARY;
    }

    let newState = updatePlayer(state, state.currentPlayerIndex, {
        position: pos,
        money
    });
    newState = { ...newState, phase: "landed", firstMove: false };
    return newState;
};

/**
 * Handle what happens when a player lands on their current tile.
 * Returns { state, action } where action describes what the UI should show.
 *   action.type: "property_unowned", "property_owned_self", "property_owned_other",
 *                "event", "tax", "go_to_jail", "go", "jail_visiting",
 *                "free_parking", "none"
 */
const handleLanding = function (state) {
    const player = currentPlayer(state);
    const tile = getTileData(player.position);
    if (!tile) return { state, action: { type: "none" } };

    switch (tile.type) {
        case "go": {
            // Collect £200 when landing (if not first move — already handled by passGo)
            // Actually landing on GO after passing it is already counted.
            // Only award if they landed exactly (rolled exactly to GO) and didn't pass.
            // The passedGo logic in movePlayer already handles this.
            return { state, action: { type: "go", message: `Landed on Student Finance!` } };
        }
        case "property":
        case "station": {
            const owner = findOwner(state, player.position);
            if (!owner) {
                return { state: { ...state, phase: "landed" }, action: { type: "property_unowned", tileId: player.position } };
            } else if (owner.id === player.id) {
                return { state, action: { type: "property_owned_self", tileId: player.position } };
            } else {
                // Pay rent
                const rentAmount = calculateRent(state, player.position, owner);
                const newState = payRent(state, state.currentPlayerIndex, state.players.indexOf(owner), rentAmount);
                return { state: newState, action: { type: "property_owned_other", tileId: player.position, owner, rentAmount } };
            }
        }
        case "tax": {
            const rate = tile.taxRate || 0.10;
            const taxAmount = Math.floor(player.money * rate);
            const newState = updatePlayer(state, state.currentPlayerIndex, {
                money: player.money - taxAmount
            });
            return { state: newState, action: { type: "tax", amount: taxAmount, tileName: tile.name } };
        }
        case "event": {
            const { state: newState, card } = drawEventCard(state);
            return { state: newState, action: { type: "event", card } };
        }
        case "go_to_jail": {
            const newState = sendToJail(state, state.currentPlayerIndex);
            return { state: newState, action: { type: "go_to_jail" } };
        }
        case "jail":
            return { state, action: { type: "jail_visiting" } };
        case "free_parking":
            return { state, action: { type: "free_parking" } };
        default:
            return { state, action: { type: "none" } };
    }
};

/** Find which player owns a tile (or null) */
const findOwner = (state, tileId) =>
    state.players.find((p) => p.properties.includes(tileId)) || null;

/** Calculate rent for a tile */
const calculateRent = (state, tileId, owner) => {
    const tile = PROPERTY_DATA[tileId];
    if (!tile) return 0;

    const ownerIndex = state.players.indexOf(owner);

    if (tile.type === "station") {
        const count = countStations(state, ownerIndex);
        return tile.rent[Math.min(count, tile.rent.length) - 1] || 0;
    }

    if (tile.colourGroup === "Museums") {
        const count = countMuseums(state, ownerIndex);
        const multiplier = tile.rent[Math.min(count, tile.rent.length) - 1] || 0;
        return multiplier * (state.lastDiceValue || 1);
    }

    const level = state.propertyLevels[tileId] || 0;
    if (level > 0) {
        return tile.rent[level + 1] || tile.rent[tile.rent.length - 1];
    }

    if (ownsFullSet(state, ownerIndex, tile.colourGroup)) {
        return tile.rent[1] || tile.rent[0] * 2;
    }

    // Base rent (no houses yet — index 0)
    return tile.rent[0] || 0;
};

/** Transfer rent from one player to another */
const payRent = function (state, fromIdx, toIdx, amount) {
    const from = state.players[fromIdx];
    const to = state.players[toIdx];
    return {
        ...state,
        players: state.players.map((p, i) => {
            if (i === fromIdx) return { ...p, money: p.money - amount };
            if (i === toIdx) return { ...p, money: p.money + amount };
            return p;
        })
    };
};

/** Buy the property the current player is standing on */
const buyProperty = function (state) {
    const player = currentPlayer(state);
    const tile = PROPERTY_DATA[player.position];
    if (!tile || !isProperty(player.position)) return state;
    if (player.money < tile.price) return state;

    return updatePlayer(state, state.currentPlayerIndex, {
        money: player.money - tile.price,
        properties: [...player.properties, player.position]
    });
};

/** Upgrade property (buy level) */
const upgradeProperty = function (state, tileId) {
    const player = currentPlayer(state);
    const tile = PROPERTY_DATA[tileId];
    if (!tile || !tile.upgradeCost) return state; // Cannot upgrade

    const ownerIndex = state.players.findIndex(p => p.properties.includes(Number(tileId)));
    if (ownerIndex !== state.currentPlayerIndex) return state; // Must own it

    if (!ownsFullSet(state, ownerIndex, tile.colourGroup)) return state; // Must own set

    if (player.money < tile.upgradeCost) return state; // Must have money

    const currentLevel = state.propertyLevels[tileId] || 0;
    if (currentLevel >= 3) return state; // Max level is 3

    const newLevels = { ...state.propertyLevels, [tileId]: currentLevel + 1 };

    return {
        ...updatePlayer(state, ownerIndex, { money: player.money - tile.upgradeCost }),
        propertyLevels: newLevels
    };
};

/** End turn — advance to next non-bankrupt player */
const endTurn = function (state) {
    let nextIdx = (state.currentPlayerIndex + 1) % state.players.length;
    let newRound = state.round;

    // Skip bankrupt players
    let safety = 0;
    while (state.players[nextIdx].isBankrupt && safety < state.players.length) {
        nextIdx = (nextIdx + 1) % state.players.length;
        safety++;
    }

    if (nextIdx <= state.currentPlayerIndex) {
        newRound++;
    }

    return {
        ...state,
        currentPlayerIndex: nextIdx,
        round: newRound,
        phase: "roll",
        lastDiceValue: null,
        hasRolled: false,
        pendingEvent: null
    };
};

/** Send a player to jail */
const sendToJail = (state, playerIdx) =>
    updatePlayer(state, playerIdx, {
        position: GAP_YEAR_TILE,
        inJail: true,
        jailTurns: 0
    });

/**
 * Handle a jail turn.
 * choice: "roll" | "pay"
 * Returns { state, escaped, diceValue }
 */
const handleJailTurn = function (state, choice) {
    const idx = state.currentPlayerIndex;
    const player = state.players[idx];

    if (choice === "pay") {
        // Block buyout if insufficient money
        if (player.money < GAP_YEAR_BUYOUT) {
            return { state, escaped: false, diceValue: null };
        }
        const newState = updatePlayer(state, idx, {
            money: player.money - GAP_YEAR_BUYOUT,
            inJail: false,
            jailTurns: 0
        });
        return { state: { ...newState, phase: "roll", hasRolled: false }, escaped: true, diceValue: null };
    }

    // Roll to escape
    const diceValue = Math.floor(Math.random() * 6) + 1;
    if (diceValue === GAP_YEAR_ESCAPE_NUMBER) {
        // Escaped! Move forward by the dice value
        let newState = updatePlayer(state, idx, {
            inJail: false,
            jailTurns: 0
        });
        newState = { ...newState, lastDiceValue: diceValue, hasRolled: true };
        newState = movePlayer(newState, diceValue);
        return { state: newState, escaped: true, diceValue };
    }

    // Didn't escape
    if (player.jailTurns >= 1) {
        // Already missed one turn — release them
        const newState = updatePlayer(state, idx, {
            inJail: false,
            jailTurns: 0
        });
        return { state: { ...newState, lastDiceValue: diceValue }, escaped: true, diceValue };
    }

    // Miss this turn
    const newState = updatePlayer(state, idx, {
        jailTurns: player.jailTurns + 1
    });
    return { state: { ...newState, lastDiceValue: diceValue }, escaped: false, diceValue };
};

/** Draw the next event card from the deck */
const drawEventCard = function (state) {
    let idx = state.eventDeckIndex;
    let deck = state.eventDeck;

    if (idx >= deck.length) {
        deck = GameLogic.shuffleArray([...GameLogic.EVENT_CARDS]);
        idx = 0;
    }

    const card = deck[idx];
    let newState = { ...state, eventDeck: deck, eventDeckIndex: idx + 1, pendingEvent: card };

    // Apply card effect
    const player = currentPlayer(newState);
    switch (card.effect.type) {
        case "gain":
            newState = updatePlayer(newState, newState.currentPlayerIndex, {
                money: player.money + card.effect.amount
            });
            break;
        case "lose":
            newState = updatePlayer(newState, newState.currentPlayerIndex, {
                money: player.money - card.effect.amount
            });
            break;
        case "move": {
            // Move to specified tile
            const target = card.effect.tileId;
            let passedGo = false;
            let pos = player.position;
            while (pos !== target) {
                pos = pos + 1;
                if (pos > TOTAL_TILES) { pos = 1; passedGo = true; }
            }
            let money = player.money;
            if (passedGo) money += GO_SALARY;
            newState = updatePlayer(newState, newState.currentPlayerIndex, {
                position: target,
                money
            });
            break;
        }
    }

    return { state: newState, card };
};

/** Declare a player bankrupt (manual action) */
const declareBankruptcy = function (state, playerIndex) {
    return updatePlayer(state, playerIndex, { isBankrupt: true });
};

/** Check if game is over (only 1 non-bankrupt player left) */
const checkWinner = function (state) {
    const alive = state.players.filter((p) => !p.isBankrupt);
    if (alive.length <= 1) {
        return { ...state, phase: "game_over", winner: alive[0] || null };
    }
    return state;
};

export default Object.freeze({
    rollDice, movePlayer, handleLanding,
    buyProperty, upgradeProperty, endTurn, payRent,
    sendToJail, handleJailTurn,
    drawEventCard, declareBankruptcy, checkWinner,
    findOwner, calculateRent, currentPlayer, ownsFullSet
});