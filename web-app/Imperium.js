import R from "./ramda.js";

/**
 * Imperium.js is a module for the Monopoly-inspired game, Imperium.
 * @namespace Imperium
 * @author Ikem
 * @version 2026
 */
const Imperium = Object.create(null);

// ── 1. Data & Constants ────────────────────────────────────────

/**
 * @memberof Imperium
 * @typedef {Object} GameState
 * @property {Imperium.Player[]} players Array of player objects.
 * @property {number} currentPlayerIndex Index of the current player in the players array.
 * @property {number} round The current round number.
 * @property {boolean} isStarted Whether the game has started.
 * @property {number} startingMoney The initial money for players.
 * @property {Imperium.EventCard[]} eventDeck The deck of event cards.
 * @property {number} eventDeckIndex The current index in the event card deck.
 * @property {string} phase The current phase of the turn (i.e. 'rolling', 'landed', 'game_over').
 * @property {number|null} lastDiceValue The value of the last rolled dice.
 * @property {Imperium.EventCard|null} pendingEvent The event card drawn.
 * @property {boolean} hasRolled Whether the current player has rolled the dice.
 * @property {boolean} firstMove Whether it is the first move of the game.
 * @property {Object.<number, number>} propertyLevels Map of tile IDs (Properties) to upgrade levels.
 * @property {Imperium.Player} [winner] The player who won the game, if over.
 */

/**
 * @memberof Imperium
 * @typedef {Object} Player
 * @property {number} id The player's ID.
 * @property {string} name The player's name.
 * @property {number} money The player's current money.
 * @property {number} position The tile ID the player is currently on.
 * @property {number[]} properties Array of tile IDs (Properties) owned by the player.
 * @property {boolean} inGapYear Whether the player is currently in the Gap Year.
 * @property {number} gapYearTurns How many turns the player has spent in Gap Year.
 * @property {boolean} isBankrupt Whether the player is bankrupt.
 * @property {string} colour The player's token colour.
 * @property {string} emoji The player's token emoji.
 */

/**
 * @memberof Imperium
 * @typedef {Object} TileData
 * @property {string} name The name of the tile.
 * @property {string} type The type of the tile.
 * @property {string|null} colourGroup The colour group the tile belongs to.
 * @property {string} description The description of the tile.
 * @property {number} [price] The initial purchase price.
 * @property {number} [upgradeCost] The cost to upgrade a property.
 * @property {number} [sellPrice] The amount received for downgrading a property.
 * @property {number[]} [rent] Array of rent values based on ownership and upgrade levels.
 * @property {number} [taxRate] The percentage of money taxed by the tax tile.
 */

/**
 * @memberof Imperium
 * @typedef {Object} EventCard
 * @property {number} id The event card ID.
 * @property {string} title The title of the event.
 * @property {string} description The description of the event.
 * @property {Object} effect The effect of the event card.
 * @property {string} effect.type The type of effect (i.e. 'gain', 'lose', 'move').
 * @property {number} [effect.amount] The amount of money to gain or lose.
 * @property {number} [effect.tileId] The tile ID (property) to move to.
 */

Imperium.starting_money = 1200;
Imperium.eastbound_station_tile = 19;
Imperium.total_tiles = 28;
Imperium.student_finance_tile = 1;
Imperium.gap_year_tile = 8;
Imperium.go_to_gap_year_tile = 22;
Imperium.bills_due_tile = 3;
Imperium.rent_due_tile = 27;
Imperium.free_parking_tile = 15;
Imperium.student_finance_money = 200;
Imperium.gap_year_buyout = 50;
Imperium.gap_year_escape_number = 6;

Imperium.token_colours = [
    "#e74c3c", "#3498db", "#2ecc71",
    "#f39c12", "#9b59b6", "#1abc9c"
];

/** player icons */
Imperium.icon_choices = [
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
Imperium.colour_sets = {
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
Imperium.property_data = {
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
Imperium.event_cards = [
    { id: 1, title: "Scholarship Award", description: "You've been awarded a scholarship! Collect £100.", effect: { type: "gain", amount: 100 } },
    { id: 2, title: "Late Submission", description: "Your coursework was submitted late. Pay a £50 penalty.", effect: { type: "lose", amount: 50 } },
    { id: 3, title: "ACE Equipment Broken", description: "You broke a 3D printer in the lab. Pay £100.", effect: { type: "lose", amount: 100 } },
    { id: 4, title: "Student Union Prize", description: "You won a Student Union competition! Collect £100.", effect: { type: "gain", amount: 100 } },
    { id: 5, title: "Student Finance Came Early", description: "Go directly to Student Finance. Collect £200.", effect: { type: "move", tileId: Imperium.student_finance_tile } },
    { id: 6, title: "Library Fine", description: "You returned a book late. Pay £30.", effect: { type: "lose", amount: 30 } },
    { id: 7, title: "Part-time Job", description: "Your campus job paid a bonus! Collect £80.", effect: { type: "gain", amount: 80 } },
    { id: 8, title: "Society Fundraiser", description: "Your society raised funds! Collect £50.", effect: { type: "gain", amount: 50 } },
    { id: 9, title: "Laptop Repair", description: "Your laptop screen cracked. Pay £100.", effect: { type: "lose", amount: 100 } },
    { id: 10, title: "Campus Swap", description: "You need to go to the White City campus. Take the shuttle to Eastbound Station.", effect: { type: "move", tileId: Imperium.eastbound_station_tile } },
    { id: 11, title: "Halls Maintenance", description: "Your halls need repairs. Pay £60.", effect: { type: "lose", amount: 60 } },
    { id: 12, title: "Research Grant", description: "You received a research grant! Collect £150.", effect: { type: "gain", amount: 150 } },
    { id: 13, title: "Forgot to Revise", description: "You forgot to revise for your exam and Fail! Take a gap year! ", effect: { type: "move", tileId: Imperium.go_to_gap_year_tile } },
    { id: 14, title: "Extra Budget", description: "You received an extra budget for your university project. Collect £50", effect: { type: "gain", amount: 50 } },
    { id: 15, title: "House Rent Increased", description: "Your landlord has increased your rent! Proceed to Rent Due to pay the additional cost.", effect: { type: "move", tileId: Imperium.rent_due_tile } }
];

// ── 2. Pure Initialization & Lookup Helpers ─────────────────────

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * @memberof Imperium
 * @function
 * @param {Array} array The array to shuffle.
 * @returns {Array} The shuffled array.
 */
Imperium.shuffle_array = function (array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let k = array[i];
        array[i] = array[j];
        array[j] = k;
    }
    return array;
};

/**
 * Returns the tile data for a given tile ID.
 * @memberof Imperium
 * @function
 * @param {number} tileId The ID of the tile.
 * @returns {Imperium.TileData} The tile data object.
 */
Imperium.get_tile_data = function (tileId) {
    return Imperium.property_data[tileId];
};

/**
 * Checks if a given tile ID corresponds to a property.
 * @memberof Imperium
 * @function
 * @param {number} tileId The ID of the tile.
 * @returns {boolean} True if the tile is a property.
 */
Imperium.is_property = R.pipe(
    Imperium.get_tile_data,
    R.prop("type"),
    R.equals("property")
);

/**
 * Checks if a given tile ID corresponds to an event tile.
 * @memberof Imperium
 * @function
 * @param {number} tileId The ID of the tile.
 * @returns {boolean} True if the tile is an event tile.
 */
Imperium.is_event = R.pipe(
    Imperium.get_tile_data,
    R.prop("type"),
    R.equals("event")
);

/**
 * Checks if a given tile ID corresponds to a station.
 * @memberof Imperium
 * @function
 * @param {number} tileId The ID of the tile.
 * @returns {boolean} True if the tile is a station.
 */
Imperium.is_station = R.pipe(
    Imperium.get_tile_data,
    R.prop("type"),
    R.equals("station")
);

/**
 * Checks if a given tile ID corresponds to a museum.
 * @memberof Imperium
 * @function
 * @param {number} tileId The ID of the tile.
 * @returns {boolean} True if the tile is a museum.
 */
Imperium.is_museum = R.pipe(
    Imperium.get_tile_data,
    R.prop("colourGroup"),
    R.equals("Museums")
);

/**
 * Returns the colour group data for a given colour group name.
 * @memberof Imperium
 * @function
 * @param {string} colourGroupName The name of the colour group.
 * @returns {Object} The colour group data object.
 */
Imperium.get_colour_group = function (colourGroupName) {
    return Imperium.colour_sets[colourGroupName];
};

/**
 * Creates a new player object.
 * @memberof Imperium
 * @function
 * @param {number} id The player's ID.
 * @param {string} name The player's name.
 * @param {string} emoji The player's chosen icon emoji.
 * @param {string} colour The player's chosen colour.
 * @returns {Imperium.Player} The newly created player object.
 */
Imperium.create_player = R.curry((id, name, emoji, colour) => ({
    id,
    name,
    money: Imperium.starting_money,
    position: Imperium.student_finance_tile,
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
    Imperium.shuffle_array,
    R.addIndex(R.map)(assignId)
);

const prepareEventDeck = function () {
    return Imperium.shuffle_array([...Imperium.event_cards]);
};

/**
 * Creates the initial game state.
 * Players are shuffled for random turn order.
 * @memberof Imperium
 * @function
 * @param {Imperium.Player[]} players Array of player objects to start the game.
 * @returns {Imperium.GameState} The newly created initial game state.
 */
Imperium.create_game_state = function (players) {
    return {
        players: preparePlayers(players),
        currentPlayerIndex: 0,
        round: 1,
        isStarted: true,
        startingMoney: Imperium.starting_money,
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

const updatePlayer = function (state, index, updates) {
    const applyUpdates = R.mergeLeft(updates);
    const updateInArray = R.adjust(index, applyUpdates);
    const updatePlayersList = R.over(R.lensProp("players"), updateInArray);
    return updatePlayersList(state);
};

/**
 * Returns the player object for the person whose turn it is.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @returns {Imperium.Player} The current player object.
 */
Imperium.current_player = function (state) {
    return R.nth(state.currentPlayerIndex, state.players);
};

const countStations = function (state, playerIndex) {
    const getProperties = R.path(["players", playerIndex, "properties"]);
    const countPlayerStations = R.pipe(
        getProperties,
        R.filter(Imperium.is_station),
        R.length
    );
    return countPlayerStations(state);
};

const countMuseums = function (state, playerIndex) {
    const getProperties = R.path(["players", playerIndex, "properties"]);
    const countPlayerMuseums = R.pipe(
        getProperties,
        R.filter(Imperium.is_museum),
        R.length
    );
    return countPlayerMuseums(state);
};

/**
 * Checks if a player owns every property in a given colour group.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @param {number} playerIndex The index of the player to check.
 * @param {string} colourGroup The name of the colour group.
 * @returns {boolean} True if the player owns all properties in the group.
 */
Imperium.owns_full_set = function (state, playerIndex, colourGroup) {
    if (!colourGroup || colourGroup === "station" || colourGroup === "Museums") {
        return false;
    }

    const getGroupTileIds = R.pipe(
        R.toPairs,
        R.filter(R.pipe(R.nth(1), R.prop("colourGroup"), R.equals(colourGroup))),
        R.map(R.pipe(R.nth(0), Number))
    );

    const groupTiles = getGroupTileIds(Imperium.property_data);
    const playerProperties = R.path(["players", playerIndex, "properties"], state);

    const playerOwnsAll = R.pipe(
        R.difference(groupTiles),
        R.isEmpty
    );

    return playerOwnsAll(playerProperties);
};

// ── 4. Game Actions ───────────────

/**
 * Rolls a single six-sided die and records the result in the game state.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @returns {Imperium.GameState} A new game state with the dice value recorded and `hasRolled` set to true.
 */
Imperium.roll_dice = function (state) {
    const diceValue = Math.floor(Math.random() * 6) + 1;

    const recordRoll = R.evolve({
        lastDiceValue: R.always(diceValue),
        hasRolled: R.T
    });

    return recordRoll(state);
};

/**
 * Moves the current player forward by a specified number of steps, wrapping around the board.
 * Collects money if passing GO.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @param {number} steps The number of steps to move.
 * @returns {Imperium.GameState} The new game state with updated player position.
 */
Imperium.move_player = function (state, steps) {
    const player = Imperium.current_player(state);

    const calculateNewPosition = function (currentPos, moves) {
        return R.mathMod(currentPos + moves - 1, Imperium.total_tiles) + 1;
    };

    const newPosition = calculateNewPosition(player.position, steps);
    const passedStudentFinance = (player.position + steps) > Imperium.total_tiles;

    const moneyToAdd = (passedStudentFinance && !state.firstMove)
        ? Imperium.student_finance_money
        : 0;

    const movementUpdates = {
        position: newPosition,
        money: R.add(player.money, moneyToAdd)
    };

    const stateAfterMove = updatePlayer(state, state.currentPlayerIndex, movementUpdates);
    const markLanded = R.mergeLeft({ phase: "landed", firstMove: false });

    return markLanded(stateAfterMove);
};

/**
 * Handles the effects of landing on a tile, such as paying rent, drawing events, or taxing.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @returns {Object} An object containing the new `state` and the `action` triggered.
 */
Imperium.handle_landing = function (state) {
    const player = Imperium.current_player(state);
    const tile = Imperium.get_tile_data(player.position);

    if (!tile) {
        return { state, action: { type: "none" } };
    }

    if (tile.type === "Student_Finance") {
        return { state, action: { type: "go", message: "Landed on Student Finance!" } };
    }

    if (tile.type === "property" || tile.type === "station") {
        const owner = Imperium.find_owner(state, player.position);

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

        const rentAmount = Imperium.calculate_rent(state, player.position, owner);
        const ownerIndex = R.findIndex(R.pipe(R.prop("id"), R.equals(owner.id)), state.players);
        const stateAfterRent = Imperium.pay_rent(state, state.currentPlayerIndex, ownerIndex, rentAmount);

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
        const { state: stateAfterEvent, card } = Imperium.draw_event_card(state);
        return {
            state: stateAfterEvent,
            action: { type: "event", card }
        };
    }

    if (tile.type === "go_to_gap_year") {
        const stateAfterGapYear = Imperium.send_to_gap_year(state, state.currentPlayerIndex);
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

/**
 * Finds which player owns a given tile ID.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @param {number} tileId The ID of the tile to check.
 * @returns {Imperium.Player|null} The owner player, or null if unowned.
 */
Imperium.find_owner = function (state, tileId) {
    const searchForOwner = R.pipe(
        R.prop("players"),
        R.find(R.pipe(R.prop("properties"), R.includes(tileId))),
        R.defaultTo(null)
    );
    return searchForOwner(state);
};

/**
 * Calculates the current rent for a given tile, considering ownership and upgrades.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @param {number} tileId The ID of the property tile.
 * @param {Imperium.Player} owner The player who owns the property.
 * @returns {number} The calculated rent amount.
 */
Imperium.calculate_rent = function (state, tileId, owner) {
    const tile = Imperium.property_data[tileId];
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

    if (Imperium.owns_full_set(state, ownerIndex, tile.colourGroup)) {
        return tile.rent[1] || tile.rent[0] * 2;
    }

    return tile.rent[0] || 0;
};

/**
 * Transfers money from one player to another to pay rent.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @param {number} fromIndex The index of the paying player.
 * @param {number} toIndex The index of the receiving player.
 * @param {number} amount The amount of rent to transfer.
 * @returns {Imperium.GameState} The new game state with updated money values.
 */
Imperium.pay_rent = function (state, fromIndex, toIndex, amount) {
    const deductFromPayer = R.over(R.lensProp("money"), R.subtract(R.__, amount));
    const addToReceiver = R.over(R.lensProp("money"), R.add(amount));

    const transferRent = R.pipe(
        R.adjust(fromIndex, deductFromPayer),
        R.adjust(toIndex, addToReceiver)
    );

    return R.over(R.lensProp("players"), transferRent, state);
};

/**
 * Buys the property the current player is standing on, if affordable.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @returns {Imperium.GameState} The game state after the purchase.
 */
Imperium.buy_property = function (state) {
    const player = Imperium.current_player(state);
    const tile = Imperium.property_data[player.position];

    if (!tile || !Imperium.is_property(player.position)) return state;
    if (player.money < tile.price) return state;

    const purchaseUpdates = {
        money: R.subtract(player.money, tile.price),
        properties: R.append(player.position, player.properties)
    };

    return updatePlayer(state, state.currentPlayerIndex, purchaseUpdates);
};

/**
 * Upgrades a property (adds a house) if the player is eligible and has sufficient funds.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @param {number} tileId The ID of the property to upgrade.
 * @returns {Imperium.GameState} The game state after upgrading the property.
 */
Imperium.upgrade_property = function (state, tileId) {
    const player = Imperium.current_player(state);
    const tile = Imperium.property_data[tileId];

    if (!tile || !tile.upgradeCost) return state;

    const ownerIndex = R.findIndex(R.pipe(R.prop("properties"), R.includes(Number(tileId))), state.players);

    if (ownerIndex !== state.currentPlayerIndex) return state;
    if (!Imperium.owns_full_set(state, ownerIndex, tile.colourGroup)) return state;
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

/**
 * Sells a property upgrade (house) back to the bank for the sell price.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @param {number} tileId The ID of the property to downgrade.
 * @returns {Imperium.GameState} The game state after selling the upgrade.
 */
Imperium.sell_property_upgrade = function (state, tileId) {
    const player = Imperium.current_player(state);
    const tile = Imperium.property_data[tileId];

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

/**
 * Ends the current turn, advancing to the next non-bankrupt player.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @returns {Imperium.GameState} The game state initialized for the next turn.
 */
Imperium.end_turn = function (state) {
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

/**
 * Instantly moves a player to the Gap Year tile and flags them as in Gap Year.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @param {number} playerIndex The index of the player to send to Gap Year.
 * @returns {Imperium.GameState} The game state after sending the player.
 */
Imperium.send_to_gap_year = function (state, playerIndex) {
    const gapYearUpdates = {
        position: Imperium.gap_year_tile,
        inGapYear: true,
        gapYearTurns: 0
    };
    return updatePlayer(state, playerIndex, gapYearUpdates);
};

/**
 * Handles a turn spent in Gap Year (either paying to leave or rolling).
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @param {string} choice The player's choice ("pay" or "roll").
 * @returns {Object} An object containing the new `state`, `escaped` boolean, and `diceValue`.
 */
Imperium.handle_gap_year_turn = function (state, choice) {
    const playerIndex = state.currentPlayerIndex;
    const player = R.nth(playerIndex, state.players);

    if (choice === "pay") {
        if (player.money < Imperium.gap_year_buyout) return { state, escaped: false, diceValue: null };

        const buyoutUpdates = {
            money: R.subtract(player.money, Imperium.gap_year_buyout),
            inGapYear: false,
            gapYearTurns: 0
        };

        const stateAfterBuyout = updatePlayer(state, playerIndex, buyoutUpdates);
        const resetForNewRoll = R.mergeLeft({ phase: "roll", hasRolled: false });

        return { state: resetForNewRoll(stateAfterBuyout), escaped: true, diceValue: null };
    }

    const diceValue = Math.floor(Math.random() * 6) + 1;

    if (diceValue === Imperium.gap_year_escape_number) {
        const escapeUpdates = { inGapYear: false, gapYearTurns: 0 };
        let stateAfterEscape = updatePlayer(state, playerIndex, escapeUpdates);
        const recordDice = R.mergeLeft({ lastDiceValue: diceValue, hasRolled: true });
        stateAfterEscape = Imperium.move_player(recordDice(stateAfterEscape), diceValue);

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

/**
 * Draws the next event card from the deck and applies its effects.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @returns {Object} An object containing the new `state` and the drawn `card`.
 */
Imperium.draw_event_card = function (state) {
    const deckIsEmpty = R.gte(state.eventDeckIndex, R.length(state.eventDeck));

    const deck = deckIsEmpty ? Imperium.shuffle_array([...Imperium.event_cards]) : state.eventDeck;
    const cardIndex = deckIsEmpty ? 0 : state.eventDeckIndex;
    const card = R.nth(cardIndex, deck);

    const updateDeckState = R.mergeLeft({
        eventDeck: deck,
        eventDeckIndex: R.add(cardIndex, 1),
        pendingEvent: card
    });

    let newState = updateDeckState(state);
    const player = Imperium.current_player(newState);

    if (card.effect.type === "gain") {
        const addMoney = R.over(R.lensProp("money"), R.add(card.effect.amount));
        newState = updatePlayer(newState, newState.currentPlayerIndex, addMoney({ money: player.money }));
    } else if (card.effect.type === "lose") {
        const deductMoney = R.over(R.lensProp("money"), R.subtract(R.__, card.effect.amount));
        newState = updatePlayer(newState, newState.currentPlayerIndex, deductMoney({ money: player.money }));
    } else if (card.effect.type === "move") {
        const targetTile = card.effect.tileId;
        const passedStudentFinance = player.position > targetTile
            && targetTile !== Imperium.gap_year_tile
            && targetTile !== Imperium.go_to_gap_year_tile;

        const moneyToAdd = passedStudentFinance ? Imperium.student_finance_money : 0;
        const moveUpdates = { position: targetTile, money: R.add(player.money, moneyToAdd) };
        newState = updatePlayer(newState, newState.currentPlayerIndex, moveUpdates);

        if (targetTile === Imperium.go_to_gap_year_tile) {
            newState = Imperium.send_to_gap_year(newState, newState.currentPlayerIndex);
        }
    }

    return { state: newState, card };
};

/**
 * Eliminates a player from the game, returning their properties to the bank.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @param {number} playerIndex The index of the bankrupt player.
 * @returns {Imperium.GameState} The game state after the player's bankruptcy.
 */
Imperium.declare_bankruptcy = function (state, playerIndex) {
    const playerProperties = R.path(["players", playerIndex, "properties"], state);

    const markBankrupt = R.mergeLeft({ isBankrupt: true, properties: [] });
    const updateBankruptPlayer = R.over(R.lensProp("players"), R.adjust(playerIndex, markBankrupt));
    const clearPropertyLevels = R.over(R.lensProp("propertyLevels"), R.omit(playerProperties));

    const applyBankruptcy = R.pipe(updateBankruptPlayer, clearPropertyLevels);
    return applyBankruptcy(state);
};

const isAlive = R.pipe(R.prop("isBankrupt"), R.not);

/**
 * Checks if only one player remains unbankrupt, declaring them the winner if so.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @returns {Imperium.GameState} The game state, possibly with phase set to 'game_over' and a 'winner'.
 */
Imperium.check_winner = function (state) {
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

export default Object.freeze(Imperium);
