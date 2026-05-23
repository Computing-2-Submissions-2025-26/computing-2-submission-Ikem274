// ============================================================
// Monopoly.js — Complete Game Engine (Data + Actions)
// Combines raw game configuration with state-transforming actions.
// ============================================================
import R from "../ramda.js";

// ── 1. Data & Constants ────────────────────────────────────────

const Starting_Money = 1000;
const Eastbound_Station_Tile = 19;
const Total_Tiles = 28;
const Student_Finance_Tile = 1;
const Gap_Year_Tile = 8;
const Go_To_Gap_Year_Tile = 22;
const Bills_Due_Tile = 3;
const Rent_Due_Tile = 27;
const Free_Parking_Tile = 15;
const Student_Finance_Money = 200;
const Gap_Year_Buyout = 50;
const Gap_Year_Escape_Number = 6;

const Token_Colours = [
    "#e74c3c", "#3498db", "#2ecc71",
    "#f39c12", "#9b59b6", "#1abc9c"
];

/** Selectable player icons */
const Icon_choices = [
    { emoji: "🎩", label: "Top Hat" },
    { emoji: "🚗", label: "Car" },
    { emoji: "🐶", label: "Dog" },
    { emoji: "⚓", label: "Anchor" },
    { emoji: "🎲", label: "Dice" },
    { emoji: "👑", label: "Crown" },
    { emoji: "🦊", label: "Fox" },
    { emoji: "🎸", label: "Guitar" },
    { emoji: "🌟", label: "Star" },
    { emoji: "🔮", label: "Crystal Ball" },
    { emoji: "🦉", label: "Owl" },
    { emoji: "🎯", label: "Target" },
    { emoji: "🏆", label: "Trophy" },
    { emoji: "💎", label: "Diamond" },
    { emoji: "🦁", label: "Lion" },
    { emoji: "🐱", label: "Cat" }
];

/** Colour sets for properties */
const ColourSets = {
    brown: { colour: "#7C4F36", label: "Brown" },
    light_blue: { colour: "#B9D1E7", label: "Light Blue" },
    pink: { colour: "#AF407E", label: "Pink" },
    orange: { colour: "#CD8E36", label: "Orange" },
    red: { colour: "#BC302B", label: "Red" },
    yellow: { colour: "#E7E24E", label: "Yellow" },
    green: { colour: "#579D57", label: "Green" },
    dark_blue: { colour: "#2C3E50", label: "Dark Blue" },
    station: { colour: "#444444", label: "Station" },
    Museums: { colour: "#EBEEEA", label: "Museums" }
};

/**
 * Property Data Definition
 * - rent array: [Without Set, With Set, Level 1: Bachelors, Level 2: Masters, Level 3: PhD]
 * - stations rent: [1 owned, 2 owned]
 */
const Property_data = {
    1: { name: "Student Finance", type: "Student_Finance", colourGroup: null, description: "Collect £200 when you land on or pass this tile." },
    2: { name: "Huxley", type: "property", price: 150, upgradeCost: 75, sellPrice: 50, rent: [0, 8, 30, 60, 180], colourGroup: "brown", description: "Huxley Building" },
    3: { name: "Bills Due", type: "tax", colourGroup: null, taxRate: 0.10, description: "Pay 10% of your total money." },
    4: { name: "Westbound Station", type: "station", price: 250, rent: [100, 200], colourGroup: "station", description: "Take the shuttle service to the other campus." },
    5: { name: "Blackett", type: "property", price: 120, upgradeCost: 100, sellPrice: 75, rent: [6, 12, 30, 90, 270], colourGroup: "light_blue", description: "Blackett Laboratory" },
    6: { name: "Event Card", type: "event", colourGroup: null, description: "Draw an Event Card." },
    7: { name: "Roderic Hill", type: "property", price: 140, upgradeCost: 100, sellPrice: 75, rent: [8, 16, 40, 100, 300], colourGroup: "light_blue", description: "Roderic Hill" },
    8: { name: "Gap Year", type: "gap_year", colourGroup: null, description: "Just visiting... unless you were sent here." },
    9: { name: "Science Museum", type: "property", price: 175, rent: [10, 20], colourGroup: "Museums", description: "Exhibition Road's finest." },
    10: { name: "Sir Alexander Fleming Building", type: "property", price: 160, upgradeCost: 100, sellPrice: 75, rent: [10, 20, 50, 150, 450], colourGroup: "pink", description: "Sir Alexander Fleming Building." },
    11: { name: "Business School", type: "property", price: 180, upgradeCost: 100, sellPrice: 75, rent: [12, 24, 60, 180, 500], colourGroup: "pink", description: "Imperial College Business School." },
    12: { name: "Event Card", type: "event", colourGroup: null, description: "Draw an Event Card." },
    13: { name: "Ace Workshop", type: "property", price: 200, upgradeCost: 150, sellPrice: 100, rent: [14, 28, 70, 200, 550], colourGroup: "orange", description: "The Design Engineering Workshop." },
    14: { name: "Dyson Building", type: "property", price: 220, upgradeCost: 150, sellPrice: 100, rent: [16, 32, 80, 220, 600], colourGroup: "orange", description: "The One and Only Dyson School of Design Engineering." },
    15: { name: "Free Parking", type: "free_parking", colourGroup: null, description: "Rest here. Nothing happens." },
    16: { name: "Sherfield Walkway", type: "property", price: 240, upgradeCost: 150, sellPrice: 100, rent: [18, 36, 90, 250, 700], colourGroup: "red", description: "Walkway with all the food you need." },
    17: { name: "Event Card", type: "event", colourGroup: null, description: "Draw an Event Card." },
    18: { name: "Abdus Salam Library", type: "property", price: 260, upgradeCost: 150, sellPrice: 100, rent: [20, 40, 100, 300, 750], colourGroup: "red", description: "The Central Library." },
    19: { name: "Eastbound Station", type: "station", price: 250, rent: [100, 200], colourGroup: "station", description: "Take the shuttle service to the other campus." },
    20: { name: "Hammersmith Hospital", type: "property", price: 280, upgradeCost: 200, sellPrice: 140, rent: [22, 44, 110, 330, 800], colourGroup: "yellow", description: "Hammersmith campus" },
    21: { name: "Charing Cross Hospital", type: "property", price: 300, upgradeCost: 200, sellPrice: 140, rent: [24, 48, 120, 360, 850], colourGroup: "yellow", description: "Charing Cross campus" },
    22: { name: "You Fail", type: "go_to_gap_year", colourGroup: null, description: "Go directly to Gap Year!" },
    23: { name: "White City Campus", type: "property", price: 320, upgradeCost: 200, sellPrice: 140, rent: [26, 52, 130, 390, 900], colourGroup: "green", description: "White City campus." },
    24: { name: "Natural History Museum", type: "property", price: 175, sellPrice: 87.5, rent: [10, 20], colourGroup: "Museums", description: "Bones and Old Stuff" },
    25: { name: "Queens Tower", type: "property", price: 340, upgradeCost: 200, sellPrice: 140, rent: [28, 56, 150, 450, 1000], colourGroup: "green", description: "THE Queen's Tower" },
    26: { name: "Event Card", type: "event", colourGroup: null, description: "Draw an Event Card." },
    27: { name: "House Rent Due", type: "tax", colourGroup: null, taxRate: 0.20, description: "Pay 20% of your total money." },
    28: { name: "Royal Albert Hall", type: "property", price: 400, upgradeCost: 250, sellPrice: 175, rent: [0, 100, 200, 600, 1400], colourGroup: "dark_blue", description: "The crown jewel of Kensington." }
};

/** Event cards */
const Event_cards = [
    { id: 1, title: "Scholarship Award", description: "You've been awarded a scholarship! Collect £100.", effect: { type: "gain", amount: 100 } },
    { id: 2, title: "Late Submission", description: "Your coursework was submitted late. Pay a £50 penalty.", effect: { type: "lose", amount: 50 } },
    { id: 3, title: "ACE Equipment Broken", description: "You broke a 3D printer in the lab. Pay £100.", effect: { type: "lose", amount: 100 } },
    { id: 4, title: "Student Union Prize", description: "You won a Student Union competition! Collect £100.", effect: { type: "gain", amount: 100 } },
    { id: 5, title: "Student Finance Came Early", description: "Go directly to Student Finance. Collect £200.", effect: { type: "move", tileId: Student_Finance_Tile } },
    { id: 6, title: "Library Fine", description: "You returned a book late. Pay £30.", effect: { type: "lose", amount: 30 } },
    { id: 7, title: "Part-time Job", description: "Your campus job paid a bonus! Collect £80.", effect: { type: "gain", amount: 80 } },
    { id: 8, title: "Society Fundraiser", description: "Your society raised funds! Collect £50.", effect: { type: "gain", amount: 50 } },
    { id: 9, title: "Laptop Repair", description: "Your laptop screen cracked. Pay £100.", effect: { type: "lose", amount: 100 } },
    { id: 10, title: "Campus Swap", description: "You need to go to the White City campus. Take the shuttle to Eastbound Station.", effect: { type: "move", tileId: Eastbound_Station_Tile } },
    { id: 11, title: "Halls Maintenance", description: "Your halls need repairs. Pay £60.", effect: { type: "lose", amount: 60 } },
    { id: 12, title: "Research Grant", description: "You received a research grant! Collect £150.", effect: { type: "gain", amount: 150 } },
    { id: 13, title: "Forgot to Revise", description: "You forgot to revise for your exam and Fail! Take a gap year! ", effect: { type: "move", tileId: Go_To_Gap_Year_Tile } },
    { id: 14, title: "Extra Budget", description: "You received an extra budget for your university project. Collect £50", effect: { type: "gain", amount: 50 } },
    { id: 15, title: "House Rent Increased", description: "Your landlord has increased your rent! Proceed to Rent Due to pay the additional cost.", effect: { type: "move", tileId: Rent_Due_Tile } }
];


// ── 2. Pure Initialization & Lookup Helpers ─────────────────────

/** Shuffles an array using the Fisher-Yates algorithm */
function ShuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let k = array[i];
        array[i] = array[j];
        array[j] = k;
    }
    return array;
}

const getTileData = function (tileId) {
    return Property_data[tileId];
};

const isProperty = R.pipe(
    getTileData,
    R.prop("type"),
    R.equals("property")
);

const isEvent = R.pipe(
    getTileData,
    R.prop("type"),
    R.equals("event")
);

const isStation = R.pipe(
    getTileData,
    R.prop("type"),
    R.equals("station")
);

const isMuseum = R.pipe(
    getTileData,
    R.prop("colourGroup"),
    R.equals("Museums")
);

const getColourGroup = function (colourGroupName) {
    return ColourSets[colourGroupName];
};

const createPlayer = R.curry((id, name, emoji, colour) => ({
    id,
    name,
    money: Starting_Money,
    position: Student_Finance_Tile,
    properties: [],
    inGapYear: false,
    gapYearTurns: 0,
    isBankrupt: false,
    colour,
    emoji
}));

const assignId = function (player, index) {
    return R.assoc("id", index + 1, player);
};

const preparePlayers = R.pipe(
    ShuffleArray,
    R.addIndex(R.map)(assignId)
);

const prepareEventDeck = function () {
    // We clone to avoid modifying the original
    return ShuffleArray([...Event_cards]);
};

/**
 * Creates the initial game state.
 * Players are shuffled for random turn order.
 */
const createGameState = function (players) {
    return {
        players: preparePlayers(players),
        currentPlayerIndex: 0,
        round: 1,
        isStarted: true,
        startingMoney: Starting_Money,
        eventDeck: prepareEventDeck(),
        eventDeckIndex: 0,
        phase: "roll",
        lastDiceValue: null,
        pendingEvent: null,
        hasRolled: false,
        firstMove: true,
        propertyLevels: {}
    };
};










// ── 3. State Transformation Helpers ────────────

/** Updates a single player inside the game state array. */
const updatePlayer = function (state, index, updates) {
    const applyUpdates = R.mergeLeft(updates);
    const updateInArray = R.adjust(index, applyUpdates);
    const updatePlayersList = R.over(R.lensProp("players"), updateInArray);
    return updatePlayersList(state);
};

/** Returns the player object for the person whose turn it is. */
const currentPlayer = function (state) {
    return R.nth(state.currentPlayerIndex, state.players);
};

/** Counts how many stations a player owns. */
const countStations = function (state, playerIndex) {
    const getProperties = R.path(["players", playerIndex, "properties"]);
    const countPlayerStations = R.pipe(
        getProperties,
        R.filter(isStation),
        R.length
    );
    return countPlayerStations(state);
};

/** Counts how many museums a player owns. */
const countMuseums = function (state, playerIndex) {
    const getProperties = R.path(["players", playerIndex, "properties"]);
    const countPlayerMuseums = R.pipe(
        getProperties,
        R.filter(isMuseum),
        R.length
    );
    return countPlayerMuseums(state);
};

/** Checks if a player owns every property in a given colour group. */
const ownsFullSet = function (state, playerIndex, colourGroup) {
    if (!colourGroup || colourGroup === "station" || colourGroup === "Museums") {
        return false;
    }

    // Find all tile IDs that belong to this colour group
    const getGroupTileIds = R.pipe(
        R.toPairs,
        R.filter(R.pipe(R.nth(1), R.prop("colourGroup"), R.equals(colourGroup))),
        R.map(R.pipe(R.nth(0), Number))
    );

    const groupTiles = getGroupTileIds(Property_data);
    const playerProperties = R.path(["players", playerIndex, "properties"], state);

    // Check if the player's properties contain every tile in the group
    const playerOwnsAll = R.pipe(
        R.difference(groupTiles),
        R.isEmpty
    );

    return playerOwnsAll(playerProperties);
};


// ── 4. Game Actions ───────────────

/** Rolls a die (1–6) and records it. */
const rollDice = function (state) {
    const diceValue = Math.floor(Math.random() * 6) + 1;

    const recordRoll = R.evolve({
        lastDiceValue: R.always(diceValue),
        hasRolled: R.T
    });

    return recordRoll(state);
};

/** Moves the current player forward and collects money if passing GO. */
const movePlayer = function (state, steps) {
    const player = currentPlayer(state);

    // Wrap around the board using modular arithmetic
    const calculateNewPosition = function (currentPos, moves) {
        return R.mathMod(currentPos + moves - 1, Total_Tiles) + 1;
    };

    const newPosition = calculateNewPosition(player.position, steps);
    const passedStudentFinance = (player.position + steps) > Total_Tiles;


    // Only award money if the player actually passed Student Finance (not on first move)
    const moneyToAdd = (passedStudentFinance && !state.firstMove)
        ? Student_Finance_Money
        : 0;

    const movementUpdates = {
        position: newPosition,
        money: R.add(player.money, moneyToAdd)
    };

    const stateAfterMove = updatePlayer(state, state.currentPlayerIndex, movementUpdates);
    const markLanded = R.mergeLeft({ phase: "landed", firstMove: false });

    return markLanded(stateAfterMove);
};

/** Handles landing effects. Returns { state, action }. */
const handleLanding = function (state) {
    const player = currentPlayer(state);
    const tile = getTileData(player.position);

    if (!tile) {
        return { state, action: { type: "none" } };
    }

    if (tile.type === "Student_Finance") {
        return { state, action: { type: "go", message: "Landed on Student Finance!" } };
    }

    if (tile.type === "property" || tile.type === "station") {
        const owner = findOwner(state, player.position);

        if (!owner) {
            const markPhase = R.mergeLeft({ phase: "landed" });
            return {
                state: markPhase(state),
                action: { type: "property_unowned", tileId: player.position }
            };
        }

        if (owner.id === player.id) {
            return {
                state,
                action: { type: "property_owned_self", tileId: player.position }
            };
        }

        const rentAmount = calculateRent(state, player.position, owner);
        const ownerIndex = R.findIndex(R.pipe(R.prop("id"), R.equals(owner.id)), state.players);
        const stateAfterRent = payRent(state, state.currentPlayerIndex, ownerIndex, rentAmount);

        return {
            state: stateAfterRent,
            action: { type: "property_owned_other", tileId: player.position, owner, rentAmount }
        };
    }

    if (tile.type === "tax") {
        const taxRate = R.propOr(0.10, "taxRate", tile);
        const taxAmount = Math.floor(R.multiply(player.money, taxRate));

        const deductTax = { money: R.subtract(player.money, taxAmount) };
        const stateAfterTax = updatePlayer(state, state.currentPlayerIndex, deductTax);

        return {
            state: stateAfterTax,
            action: { type: "tax", amount: taxAmount, tileName: tile.name }
        };
    }

    if (tile.type === "event") {
        const { state: stateAfterEvent, card } = drawEventCard(state);
        return {
            state: stateAfterEvent,
            action: { type: "event", card }
        };
    }

    if (tile.type === "go_to_gap_year") {
        const stateAfterGapYear = sendToGapYear(state, state.currentPlayerIndex);
        return {
            state: stateAfterGapYear,
            action: { type: "go_to_gap_year" }
        };
    }

    if (tile.type === "gap_year") {
        return { state, action: { type: "gap_year_visiting" } };
    }

    if (tile.type === "free_parking") {
        return { state, action: { type: "free_parking" } };
    }

    return { state, action: { type: "none" } };
};

/** Finds which player owns a given tile. */
const findOwner = function (state, tileId) {
    const searchForOwner = R.pipe(
        R.prop("players"),
        R.find(R.pipe(R.prop("properties"), R.includes(tileId))),
        R.defaultTo(null)
    );
    return searchForOwner(state);
};

/** Calculates rent, taking into account multipliers, groups, and levels. */
const calculateRent = function (state, tileId, owner) {
    const tile = Property_data[tileId];
    if (!tile) return 0;

    const ownerIndex = state.players.indexOf(owner);

    if (tile.type === "station") {
        const stationCount = countStations(state, ownerIndex);
        const rentIndex = Math.min(stationCount, tile.rent.length) - 1;
        return tile.rent[rentIndex] || 0;
    }

    if (tile.colourGroup === "Museums") {
        const museumCount = countMuseums(state, ownerIndex);
        const rentIndex = Math.min(museumCount, tile.rent.length) - 1;
        const multiplier = tile.rent[rentIndex] || 0;
        return multiplier * (state.lastDiceValue || 1);
    }

    const upgradeLevel = state.propertyLevels[tileId] || 0;
    if (upgradeLevel > 0) {
        return tile.rent[upgradeLevel + 1] || tile.rent[tile.rent.length - 1];
    }

    if (ownsFullSet(state, ownerIndex, tile.colourGroup)) {
        return tile.rent[1] || tile.rent[0] * 2;
    }

    return tile.rent[0] || 0;
};

/** Transfers money between two players. */
const payRent = function (state, fromIndex, toIndex, amount) {
    const deductFromPayer = R.over(R.lensProp("money"), R.subtract(R.__, amount));
    const addToReceiver = R.over(R.lensProp("money"), R.add(amount));

    const transferRent = R.pipe(
        R.adjust(fromIndex, deductFromPayer),
        R.adjust(toIndex, addToReceiver)
    );

    return R.over(R.lensProp("players"), transferRent, state);
};


/** Buys the property the current player is standing on. */
const buyProperty = function (state) {
    const player = currentPlayer(state);
    const tile = Property_data[player.position];

    if (!tile || !isProperty(player.position)) return state;
    if (player.money < tile.price) return state;

    const purchaseUpdates = {
        money: R.subtract(player.money, tile.price),
        properties: R.append(player.position, player.properties)
    };

    return updatePlayer(state, state.currentPlayerIndex, purchaseUpdates);
};



/** Upgrades a property (adds a house) if the player is eligible. */
const upgradeProperty = function (state, tileId) {
    const player = currentPlayer(state);
    const tile = Property_data[tileId];

    if (!tile || !tile.upgradeCost) return state;

    const ownerIndex = R.findIndex(R.pipe(R.prop("properties"), R.includes(Number(tileId))), state.players);

    if (ownerIndex !== state.currentPlayerIndex) return state;
    if (!ownsFullSet(state, ownerIndex, tile.colourGroup)) return state;
    if (player.money < tile.upgradeCost) return state;

    const currentLevel = R.propOr(0, tileId, state.propertyLevels);
    if (currentLevel >= 3) return state;

    const increaseLevel = R.over(
        R.lensProp("propertyLevels"),
        R.assoc(tileId, R.add(1, currentLevel))
    );

    const deductUpgradeCost = R.over(
        R.lensProp("players"),
        R.adjust(ownerIndex, R.over(R.lensProp("money"), R.subtract(R.__, tile.upgradeCost)))
    );

    const applyUpgrade = R.pipe(deductUpgradeCost, increaseLevel);
    return applyUpgrade(state);
};



/** Sells a house and gives the player money back. */
const sellPropertyUpgrade = function (state, tileId) {
    const player = currentPlayer(state);
    const tile = Property_data[tileId];

    if (!tile || !tile.sellPrice) return state;

    const ownerIndex = R.findIndex(R.pipe(R.prop("properties"), R.includes(Number(tileId))), state.players);

    if (ownerIndex !== state.currentPlayerIndex) return state;

    const currentLevel = R.propOr(0, tileId, state.propertyLevels);
    if (currentLevel <= 0) return state;

    const decreaseLevel = R.over(
        R.lensProp("propertyLevels"),
        R.assoc(tileId, R.subtract(currentLevel, 1))
    );

    const addSellFunds = R.over(
        R.lensProp("players"),
        R.adjust(ownerIndex, R.over(R.lensProp("money"), R.add(tile.sellPrice)))
    );

    const applySell = R.pipe(addSellFunds, decreaseLevel);
    return applySell(state);
};



/** Ends the turn and skips bankrupt players. */
const endTurn = function (state) {
    const playersCount = R.length(state.players);
    let nextIndex = (state.currentPlayerIndex + 1) % playersCount;
    let newRound = state.round;

    let safety = 0;
    while (state.players[nextIndex].isBankrupt && safety < playersCount) {
        nextIndex = (nextIndex + 1) % playersCount;
        safety++;
    }

    if (nextIndex <= state.currentPlayerIndex) {
        newRound++;
    }

    const advanceToNextTurn = R.mergeLeft({
        currentPlayerIndex: nextIndex,
        round: newRound,
        phase: "roll",
        lastDiceValue: null,
        hasRolled: false,
        pendingEvent: null
    });

    return advanceToNextTurn(state);
};



/** Warps a player to the Gap Year tile. */
const sendToGapYear = function (state, playerIndex) {
    const gapYearUpdates = {
        position: Gap_Year_Tile,
        inGapYear: true,
        gapYearTurns: 0
    };
    return updatePlayer(state, playerIndex, gapYearUpdates);
};



/** Handles a turn spent in Gap Year (either paying to leave or rolling). */
const handleGapYearTurn = function (state, choice) {
    const playerIndex = state.currentPlayerIndex;
    const player = R.nth(playerIndex, state.players);

    if (choice === "pay") {
        if (player.money < Gap_Year_Buyout) return { state, escaped: false, diceValue: null };

        const buyoutUpdates = {
            money: R.subtract(player.money, Gap_Year_Buyout),
            inGapYear: false,
            gapYearTurns: 0
        };

        const stateAfterBuyout = updatePlayer(state, playerIndex, buyoutUpdates);
        const resetForNewRoll = R.mergeLeft({ phase: "roll", hasRolled: false });

        return { state: resetForNewRoll(stateAfterBuyout), escaped: true, diceValue: null };
    }

    const diceValue = Math.floor(Math.random() * 6) + 1;

    if (diceValue === Gap_Year_Escape_Number) {
        const escapeUpdates = { inGapYear: false, gapYearTurns: 0 };
        let stateAfterEscape = updatePlayer(state, playerIndex, escapeUpdates);
        const recordDice = R.mergeLeft({ lastDiceValue: diceValue, hasRolled: true });
        stateAfterEscape = movePlayer(recordDice(stateAfterEscape), diceValue);

        return { state: stateAfterEscape, escaped: true, diceValue };
    }

    if (player.gapYearTurns > 0) {
        const releaseUpdates = { inGapYear: false, gapYearTurns: 0 };
        const stateAfterRelease = updatePlayer(state, playerIndex, releaseUpdates);
        const recordDice = R.mergeLeft({ lastDiceValue: diceValue });

        return { state: recordDice(stateAfterRelease), escaped: true, diceValue };
    }

    const missedTurnUpdates = { gapYearTurns: R.add(1, player.gapYearTurns) };
    const stateAfterMiss = updatePlayer(state, playerIndex, missedTurnUpdates);
    const recordDice = R.mergeLeft({ lastDiceValue: diceValue });

    return { state: recordDice(stateAfterMiss), escaped: false, diceValue };
};



/** Draws an event card and applies its effect. */
const drawEventCard = function (state) {
    const deckIsEmpty = R.gte(state.eventDeckIndex, R.length(state.eventDeck));

    const deck = deckIsEmpty ? ShuffleArray([...Event_cards]) : state.eventDeck;
    const cardIndex = deckIsEmpty ? 0 : state.eventDeckIndex;
    const card = R.nth(cardIndex, deck);

    const updateDeckState = R.mergeLeft({
        eventDeck: deck,
        eventDeckIndex: R.add(cardIndex, 1),
        pendingEvent: card
    });

    let newState = updateDeckState(state);
    const player = currentPlayer(newState);

    if (card.effect.type === "gain") {
        const addMoney = R.over(R.lensProp("money"), R.add(card.effect.amount));
        newState = updatePlayer(newState, newState.currentPlayerIndex, addMoney({ money: player.money }));
    } else if (card.effect.type === "lose") {
        const deductMoney = R.over(R.lensProp("money"), R.subtract(R.__, card.effect.amount));
        newState = updatePlayer(newState, newState.currentPlayerIndex, deductMoney({ money: player.money }));
    } else if (card.effect.type === "move") {
        const targetTile = card.effect.tileId;
        const passedStudentFinance = player.position > targetTile
            && targetTile !== Gap_Year_Tile
            && targetTile !== Go_To_Gap_Year_Tile;

        const moneyToAdd = passedStudentFinance ? Student_Finance_Money : 0;
        const moveUpdates = { position: targetTile, money: R.add(player.money, moneyToAdd) };
        newState = updatePlayer(newState, newState.currentPlayerIndex, moveUpdates);

        if (targetTile === Go_To_Gap_Year_Tile) {
            newState = sendToGapYear(newState, newState.currentPlayerIndex);
        }
    }

    return { state: newState, card };
};



/** Eliminates a player and hands their properties back to the bank. */
const declareBankruptcy = function (state, playerIndex) {
    const playerProperties = R.path(["players", playerIndex, "properties"], state);

    const markBankrupt = R.mergeLeft({ isBankrupt: true, properties: [] });
    const updateBankruptPlayer = R.over(R.lensProp("players"), R.adjust(playerIndex, markBankrupt));
    const clearPropertyLevels = R.over(R.lensProp("propertyLevels"), R.omit(playerProperties));

    const applyBankruptcy = R.pipe(updateBankruptPlayer, clearPropertyLevels);
    return applyBankruptcy(state);
};

const isAlive = R.pipe(R.prop("isBankrupt"), R.not);



/** Checks if someone has won by being the last player standing. */
const checkWinner = function (state) {
    const alivePlayers = R.filter(isAlive, state.players);

    if (R.length(alivePlayers) <= 1) {
        const declareGameOver = R.mergeLeft({
            phase: "game_over",
            winner: R.head(alivePlayers) || null
        });
        return declareGameOver(state);
    }

    return state;
};




// ── 5. ─────────────────────────────────────────────

export default Object.freeze({
    // Constants
    Starting_Money, Total_Tiles, Student_Finance_Tile, Gap_Year_Tile,
    Go_To_Gap_Year_Tile, Bills_Due_Tile, Rent_Due_Tile,
    Free_Parking_Tile, Student_Finance_Money, Gap_Year_Buyout,
    Gap_Year_Escape_Number, Token_Colours, Icon_choices,
    ColourSets, Property_data, Event_cards,

    // Helpers
    ShuffleArray, getTileData, isProperty, isEvent, isStation, isMuseum,
    getColourGroup, createPlayer, createGameState, currentPlayer, ownsFullSet,

    // Actions
    rollDice, movePlayer, handleLanding, findOwner, calculateRent, payRent,
    buyProperty, upgradeProperty, sellPropertyUpgrade, endTurn,
    sendToGapYear, handleGapYearTurn, drawEventCard, declareBankruptcy, checkWinner
});
