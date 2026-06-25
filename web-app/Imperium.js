import R from "./ramda.js";
import gameConfig from "./gameConfig.js";

/**
 * Imperium.js is a module for the Monopoly-inspired game, Imperium.
 * @namespace Imperium
 * @author Ikem
 * @version 2026
 */
const Imperium = Object.create(null);

// ── 1. Data & Constants ────────────────────────────────────────

/**
 * Represents the complete state of an Imperium game at any given moment.
 * Contains all players, the board's condition, and the current turn's details.
 * @memberof Imperium
 * @typedef {Object} GameState
 * @property {Imperium.Player[]} players Array of player objects.
 * @property {number} currentPlayerIndex Current player's index in
 *     players array.
 * @property {number} round The current round number.
 * @property {boolean} isStarted Whether the game has started.
 * @property {number} startingMoney The initial money for players.
 * @property {Imperium.EventCard[]} eventDeck The deck of event cards.
 * @property {number} eventDeckIndex The current index in the event card deck.
 * @property {string} phase The current phase of the turn (i.e.
 *     'rolling', 'landed', 'game_over').
 * @property {number|undefined} lastDiceValue The value of the last rolled dice.
 * @property {Imperium.EventCard|undefined} pendingEvent The event card drawn.
 * @property {boolean} hasRolled Whether the current player has rolled the dice.
 * @property {boolean} firstMove Whether it is the first move of the game.
 * @property {Object.<number, number>} propertyLevels Map of tile
 *     IDs (Properties) to upgrade levels.
 * @property {Imperium.Player} [winner] The player who won the game, if over.
 */

/**
 * Represents an individual participant in the game.
 * Tracks their money, properties owned, and current board position.
 * @memberof Imperium
 * @typedef {Object} Player
 * @property {number} id The player's ID.
 * @property {string} name The player's name.
 * @property {number} money The player's current money.
 * @property {number} position The tile ID the player is currently on.
 * @property {number[]} properties Array of tile IDs (Properties)
 *     owned by the player.
 * @property {boolean} inGapYear Whether the player is currently in
 *     the Gap Year.
 * @property {number} gapYearTurns How many turns the player has
 *     spent in Gap Year.
 * @property {boolean} isBankrupt Whether the player is bankrupt.
 * @property {string} colour The player's token colour.
 * @property {string} emoji The player's token emoji.
 */

/**
 * Defines the static properties of a square on the game board.
 * Includes purchasing costs, rents, and group categories.
 * @memberof Imperium
 * @typedef {Object} TileData
 * @property {string} name The name of the tile.
 * @property {string} type The type of the tile.
 * @property {string|undefined} colourGroup The colour group the
 *     tile belongs to.
 * @property {string} description The description of the tile.
 * @property {number} [price] The initial purchase price.
 * @property {number} [upgradeCost] The cost to upgrade a property.
 * @property {number} [sellPrice] The amount received for
 *     downgrading a property.
 * @property {number[]} [rent] Array of rent values based on
 *     ownership and upgrade levels.
 * @property {number} [taxRate] The percentage of money taxed by the tax tile.
 */

/**
 * A card drawn when landing on an Event tile.
 * Contains instructions that immediately affect the player.
 * @memberof Imperium
 * @typedef {Object} EventCard
 * @property {number} id The event card ID.
 * @property {string} title The title of the event.
 * @property {string} description The description of the event.
 * @property {Object} effect The effect of the event card.
 * @property {string} effect.type The type of effect (i.e. 'gain',
 *     'lose', 'move').
 * @property {number} [effect.amount] The amount of money to gain or lose.
 * @property {number} [effect.tileId] The tile ID (property) to move to.
 */

// ── Load configuration from gameConfig ──────────
Object.assign(Imperium, gameConfig);

// ── 2. Pure Initialization & Lookup Helpers ─────────────────────

/**
 * Randomises the order of elements in a given collection.
 * Used for shuffling the event card deck
 * or randomising the starting turn order.
 * @memberof Imperium
 * @function
 * @param {Array} array The array to shuffle.
 * @returns {Array} A new shuffled copy of the array.
 */
Imperium.shuffle_array = function (array, random) {
    const copy = [...array];
    let i = copy.length - 1;

    while (i > 0) {
        const j = Math.floor(random() * (i + 1));

        const temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;

        i -= 1;
    }

    return copy;
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
    R.prop("colourGroup"),
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
    (players) => Imperium.shuffle_array(players, Math.random),
    R.addIndex(R.map)(assignId)
);

const prepareEventDeck = function () {
    return Imperium.shuffle_array([...Imperium.event_cards], Math.random);
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
        lastDiceValue: undefined,
        pendingEvent: undefined,
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
    if (
        (!colourGroup) ||
        (colourGroup === "station") ||
        (colourGroup === "Museums")
    ) {
        return false;
    }

    const getGroupTileIds = R.pipe(
        R.toPairs,
        R.filter(
            R.pipe(
                R.nth(1),
                R.prop("colourGroup"),
                R.equals(colourGroup)
            )
        ),
        R.map(R.pipe(R.nth(0), Number))
    );

    const groupTiles = getGroupTileIds(Imperium.property_data);
    const playerProperties = R.path(
        ["players", playerIndex, "properties"],
        state
    );

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
 * @returns {Imperium.GameState} A new game state with the dice
 *     value recorded and `hasRolled` set to true.
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
 * Moves the current player forward by a specified number of steps,
 * wrapping around the board. Collects money if passing Student Finance.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @param {number} steps The number of steps to move.
 * @returns {Imperium.GameState} The new game state with updated
 *     player position.
 */
Imperium.move_player = function (state, steps) {
    const player = Imperium.current_player(state);

    const calculateNewPosition = function (currentPos, moves) {
        return R.mathMod(currentPos + moves - 1, Imperium.total_tiles) + 1;
    };

    const newPosition = calculateNewPosition(player.position, steps);
    const passedStudentFinance = (
        (player.position + steps) > Imperium.total_tiles
    );

    const moneyToAdd = (
        (passedStudentFinance && !state.firstMove)
        ? Imperium.student_finance_money
        : 0
    );

    const movementUpdates = {
        position: newPosition,
        money: R.add(player.money, moneyToAdd)
    };

    const stateAfterMove = updatePlayer(
        state,
        state.currentPlayerIndex,
        movementUpdates
    );
    const markLanded = R.mergeLeft({phase: "landed", firstMove: false});

    return markLanded(stateAfterMove);
};

/**
 * Handles the effects of landing on a tile, such as paying rent,
 * drawing events, or taxing.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @returns {Object} An object containing the new `state` and the
 *     `action` triggered.
 */
Imperium.handle_landing = function (state) {
    const player = Imperium.current_player(state);
    const tile = Imperium.get_tile_data(player.position);

    if (!tile) {
        return {state, action: {type: "none"}};
    }

    if (tile.type === "Student_Finance") {
        return {
            state,
            action: {
                type: "Student_Finance",
                message: "Landed on Student Finance!"
            }
        };
    }

    if (tile.type === "property") {
        const owner = Imperium.find_owner(state, player.position);

        if (!owner) {
            const markPhase = R.mergeLeft({phase: "landed"});
            return {
                state: markPhase(state),
                action: {type: "property_unowned", tileId: player.position}
            };
        }

        if (owner.id === player.id) {
            return {
                state,
                action: {type: "property_owned_self", tileId: player.position}
            };
        }

        const rentAmount = Imperium.calculate_rent(
            state,
            player.position,
            owner
        );
        const ownerIndex = R.findIndex(
            R.pipe(R.prop("id"), R.equals(owner.id)),
            state.players
        );
        const stateAfterRent = Imperium.pay_rent(
            state,
            state.currentPlayerIndex,
            ownerIndex,
            rentAmount
        );

        return {
            state: stateAfterRent,
            action: {
                type: "property_owned_other",
                tileId: player.position,
                owner,
                rentAmount
            }
        };
    }

    if (tile.type === "tax") {
        const taxRate = R.propOr(0.10, "taxRate", tile);
        const taxAmount = Math.floor(R.multiply(player.money, taxRate));

        const deductTax = {money: R.subtract(player.money, taxAmount)};
        const stateAfterTax = updatePlayer(
            state,
            state.currentPlayerIndex,
            deductTax
        );

        return {
            state: stateAfterTax,
            action: {type: "tax", amount: taxAmount, tileName: tile.name}
        };
    }

    if (tile.type === "event") {
        const eventResult = Imperium.draw_event_card(state);
        return {
            state: eventResult.state,
            action: {type: "event", card: eventResult.card}
        };
    }

    if (tile.type === "go_to_gap_year") {
        const stateAfterGapYear = Imperium.send_to_gap_year(
            state,
            state.currentPlayerIndex
        );
        return {
            state: stateAfterGapYear,
            action: {type: "go_to_gap_year"}
        };
    }

    if (tile.type === "gap_year") {
        return {state, action: {type: "gap_year_visiting"}};
    }

    if (tile.type === "Student_Union") {
        return {state, action: {type: "Student_Union"}};
    }

    return {state, action: {type: "none"}};
};

/**
 * Finds which player owns a given tile ID.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @param {number} tileId The ID of the tile to check.
 * @returns {Imperium.Player|undefined} The owner player,
 * or undefined if unowned.
 */
Imperium.find_owner = function (state, tileId) {
    const searchForOwner = R.pipe(
        R.prop("players"),
        R.find(R.pipe(R.prop("properties"), R.includes(tileId))),
        R.defaultTo(undefined)
    );
    return searchForOwner(state);
};

/**
 * Calculates the current rent for a given tile, considering
 * ownership and upgrades.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @param {number} tileId The ID of the property tile.
 * @param {Imperium.Player} owner The player who owns the property.
 * @returns {number} The calculated rent amount.
 * @example
 * const rent = Imperium.calculate_rent(state, 5, playerTwo);
 */
Imperium.calculate_rent = function (state, tileId, owner) {
    const tile = Imperium.property_data[tileId];
    if (!tile) {
        return 0;
    }

    const ownerIndex = R.indexOf(owner, state.players);

    if (tile.type === "station") {
        const stationCount = countStations(state, ownerIndex);
        const rentIndex = Math.min(
            stationCount,
            tile.rent.length
        ) - 1;
        return tile.rent[rentIndex] || 0;
    }

    if (tile.colourGroup === "Museums") {
        const museumCount = countMuseums(state, ownerIndex);
        const museumRentIndex = Math.min(
            museumCount,
            tile.rent.length
        ) - 1;
        const multiplier = tile.rent[museumRentIndex] || 0;
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
    const deductFromPayer = R.over(
        R.lensProp("money"),
        (money) => money - amount
    );
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
 * @example
 * const new_state = Imperium.buy_property(state);
 */
Imperium.buy_property = function (state) {
    const player = Imperium.current_player(state);
    const tile = Imperium.property_data[player.position];

    if (!tile || !Imperium.is_property(player.position)) {
        return state;
    }
    if (player.money < tile.price) {
        return state;
    }

    const purchaseUpdates = {
        money: R.subtract(player.money, tile.price),
        properties: R.append(player.position, player.properties)
    };

    return updatePlayer(state, state.currentPlayerIndex, purchaseUpdates);
};

/**
 * Upgrades a property (adds a degree) if the player is eligible and
 * has sufficient funds.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @param {number} tileId The ID of the property to upgrade.
 * @returns {Imperium.GameState} The game state after upgrading the property.
 */
Imperium.upgrade_property = function (state, tileId) {
    const player = Imperium.current_player(state);
    const tile = Imperium.property_data[tileId];

    if (!tile || !tile.upgradeCost) {
        return state;
    }

    const ownerIndex = R.findIndex(
        R.pipe(R.prop("properties"), R.includes(Number(tileId))),
        state.players
    );

    if (ownerIndex !== state.currentPlayerIndex) {
        return state;
    }
    if (!Imperium.owns_full_set(state, ownerIndex, tile.colourGroup)) {
        return state;
    }
    if (player.money < tile.upgradeCost) {
        return state;
    }

    const currentLevel = R.propOr(0, tileId, state.propertyLevels);
    if (currentLevel >= 3) {
        return state;
    }

    const increaseLevel = R.over(
        R.lensProp("propertyLevels"),
        R.assoc(tileId, R.add(1, currentLevel))
    );

    const deductUpgradeCost = R.over(
        R.lensProp("players"),
        R.adjust(
            ownerIndex,
            R.over(
                R.lensProp("money"),
                (money) => money - tile.upgradeCost
            )
        )
    );

    const applyUpgrade = R.pipe(deductUpgradeCost, increaseLevel);
    return applyUpgrade(state);
};

/**
 * Sells a property upgrade (degree) back for the sell price.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @param {number} tileId The ID of the property to downgrade.
 * @returns {Imperium.GameState} The game state after selling the upgrade.
 * @example
 * const new_state = Imperium.sell_property_upgrade(state, 2);
 */
Imperium.sell_property_upgrade = function (state, tileId) {
    const tile = Imperium.property_data[tileId];

    if (!tile || !tile.sellPrice) {
        return state;
    }

    const ownerIndex = R.findIndex(
        R.pipe(R.prop("properties"), R.includes(Number(tileId))),
        state.players
    );

    if (ownerIndex !== state.currentPlayerIndex) {
        return state;
    }

    const currentLevel = R.propOr(0, tileId, state.propertyLevels);
    if (currentLevel <= 0) {
        return state;
    }

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
    const nextIndex = (state.currentPlayerIndex + 1) % playersCount;
    const newRound = (
        nextIndex <= state.currentPlayerIndex
        ? state.round + 1
        : state.round
    );

    const advanceToNextTurn = R.mergeLeft({
        currentPlayerIndex: nextIndex,
        round: newRound,
        phase: "roll",
        lastDiceValue: undefined,
        hasRolled: false,
        pendingEvent: undefined
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
 * @returns {Object} An object containing the new `state`,
 *     `escaped` boolean, and `diceValue`.
 */
Imperium.handle_gap_year_turn = function (state, choice) {
    const playerIndex = state.currentPlayerIndex;
    const player = R.nth(playerIndex, state.players);

    if (choice === "pay") {
        if (player.money < Imperium.gap_year_buyout) {
            return {state, escaped: false, diceValue: undefined};
        }

        const buyoutUpdates = {
            money: R.subtract(player.money, Imperium.gap_year_buyout),
            inGapYear: false,
            gapYearTurns: 0
        };

        const stateAfterBuyout = updatePlayer(
            state,
            playerIndex,
            buyoutUpdates
        );
        const resetForNewRoll = R.mergeLeft({
            phase: "roll",
            hasRolled: false
        });

        return {
            state: resetForNewRoll(stateAfterBuyout),
            escaped: true,
            diceValue: undefined
        };
    }

    const diceValue = Math.floor(Math.random() * 6) + 1;

    if (diceValue === Imperium.gap_year_escape_number) {
        const escapeUpdates = {inGapYear: false, gapYearTurns: 0};
        const stateAfterEscape = updatePlayer(
            state,
            playerIndex,
            escapeUpdates
        );
        const diceRecorded1 = R.mergeLeft({
            lastDiceValue: diceValue,
            hasRolled: true
        });
        const stateAfterMove = Imperium.move_player(
            diceRecorded1(stateAfterEscape),
            diceValue
        );

        return {state: stateAfterMove, escaped: true, diceValue};
    }

    if (player.gapYearTurns > 0) {
        const releaseUpdates = {inGapYear: false, gapYearTurns: 0};
        const stateAfterRelease = updatePlayer(
            state,
            playerIndex,
            releaseUpdates
        );
        const diceRecorded2 = R.mergeLeft({lastDiceValue: diceValue});

        return {
            state: diceRecorded2(stateAfterRelease),
            escaped: true,
            diceValue
        };
    }

    const missedTurnUpdates = {gapYearTurns: R.add(1, player.gapYearTurns)};
    const stateAfterMiss = updatePlayer(state, playerIndex, missedTurnUpdates);
    const diceRecorded3 = R.mergeLeft({lastDiceValue: diceValue});

    return {state: diceRecorded3(stateAfterMiss), escaped: false, diceValue};
};

/**
 * Draws the next event card from the deck and applies its effects.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @returns {Object} An object containing the new `state` and the drawn `card`.
 */
Imperium.draw_event_card = function (state) {
    const deckIsEmpty = R.gte(
        state.eventDeckIndex,
        R.length(state.eventDeck)
    );

    const deck = (
        deckIsEmpty
        ? Imperium.shuffle_array([...Imperium.event_cards], Math.random)
        : state.eventDeck
    );
    const cardIndex = (
        deckIsEmpty
        ? 0
        : state.eventDeckIndex
    );
    const card = R.nth(cardIndex, deck);

    const updateDeckState = R.mergeLeft({
        eventDeck: deck,
        eventDeckIndex: R.add(cardIndex, 1),
        pendingEvent: card
    });

    const baseState = updateDeckState(state);
    const player = Imperium.current_player(baseState);

    const applyEffect = function (currentState) {
        if (card.effect.type === "gain") {
            return updatePlayer(
                currentState,
                currentState.currentPlayerIndex,
                {money: player.money + card.effect.amount}
            );
        }
        if (card.effect.type === "lose") {
            return updatePlayer(
                currentState,
                currentState.currentPlayerIndex,
                {money: player.money - card.effect.amount}
            );
        }
        if (card.effect.type === "move") {
            const targetTile = card.effect.tileId;
            const passedStudentFinance = (
                player.position > targetTile &&
                targetTile !== Imperium.gap_year_tile &&
                targetTile !== Imperium.go_to_gap_year_tile
            );

            const moneyToAdd = (
                passedStudentFinance
                ? Imperium.student_finance_money
                : 0
            );
            const moveUpdates = {
                position: targetTile,
                money: R.add(player.money, moneyToAdd)
            };
            const movedState = updatePlayer(
                currentState,
                currentState.currentPlayerIndex,
                moveUpdates
            );

            if (targetTile === Imperium.go_to_gap_year_tile) {
                return Imperium.send_to_gap_year(
                    movedState,
                    movedState.currentPlayerIndex
                );
            }
            return movedState;
        }
        return currentState;
    };

    return {state: applyEffect(baseState), card};
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
    const playerProperties = R.path(
        ["players", playerIndex, "properties"],
        state
    );

    const markBankrupt = R.mergeLeft({
        isBankrupt: true,
        properties: []
    });
    const updateBankruptPlayer = R.over(
        R.lensProp("players"),
        R.adjust(playerIndex, markBankrupt)
    );
    const clearPropertyLevels = R.over(
        R.lensProp("propertyLevels"),
        R.omit(R.map(String, playerProperties))
    );

    const applyBankruptcy = R.pipe(updateBankruptPlayer, clearPropertyLevels);
    return applyBankruptcy(state);
};

const isAlive = R.pipe(R.prop("isBankrupt"), R.not);

/**
 * Checks if only one player remains unbankrupt, declaring them the
 * winner if so.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @returns {Imperium.GameState} The game state, possibly with phase
 *     set to 'game_over' and a 'winner'.
 */
Imperium.check_winner = function (state) {
    const alivePlayers = R.filter(isAlive, state.players);

    if (R.length(alivePlayers) <= 1) {
        const declareGameOver = R.mergeLeft({
            phase: "game_over",
            winner: R.head(alivePlayers) || undefined
        });
        return declareGameOver(state);
    }

    return state;
};

/**
 * Executes a trade between two players, exchanging money and/or properties.
 * @memberof Imperium
 * @function
 * @param {Imperium.GameState} state The current game state.
 * @param {number} fromIndex The index of the player initiating the trade.
 * @param {number} toIndex The index of the player receiving the trade.
 * @param {Object} offer The trade offer.
 * @param {number} offer.moneyFromA Money offered by player A (fromIndex).
 * @param {number} offer.moneyFromB Money offered by player B (toIndex).
 * @param {number[]} offer.propertiesFromA Tile IDs offered by player A.
 * @param {number[]} offer.propertiesFromB Tile IDs offered by player B.
 * @returns {Imperium.GameState|undefined} The new game state after trade,
 *     or undefined if invalid.
 * @example
 * const offer = {
 *     moneyFromA: 500,
 *     moneyFromB: 0,
 *     propertiesFromA: [2, 4],
 *     propertiesFromB: [7]
 * };
 * const new_state = Imperium.execute_trade(state, 0, 1, offer);
 */
Imperium.execute_trade = function (state, fromIndex, toIndex, offer) {
    const playerA = state.players[fromIndex];
    const playerB = state.players[toIndex];

    if (!playerA || !playerB) {
        return undefined;
    }
    if (playerA.isBankrupt || playerB.isBankrupt) {
        return undefined;
    }

    // Validate money
    if (offer.moneyFromA < 0 || offer.moneyFromB < 0) {
        return undefined;
    }
    if (playerA.money < offer.moneyFromA) {
        return undefined;
    }
    if (playerB.money < offer.moneyFromB) {
        return undefined;
    }

    // Validate property ownership
    const aOwnsAll = R.all(
        (tileId) => R.includes(tileId, playerA.properties),
        offer.propertiesFromA
    );
    const bOwnsAll = R.all(
        (tileId) => R.includes(tileId, playerB.properties),
        offer.propertiesFromB
    );
    if (!aOwnsAll || !bOwnsAll) {
        return undefined;
    }

    // Reject trades involving upgraded properties
    const hasUpgrades = R.any(
        (tileId) => (state.propertyLevels[tileId] || 0) > 0,
        R.concat(offer.propertiesFromA, offer.propertiesFromB)
    );
    if (hasUpgrades) {
        return undefined;
    }

    // Transfer money
    const netMoneyToA = offer.moneyFromB - offer.moneyFromA;
    const updatedPlayerA = R.pipe(
        R.over(R.lensProp("money"), R.add(netMoneyToA)),
        R.over(
            R.lensProp("properties"),
            R.pipe(
                R.without(offer.propertiesFromA),
                (arr) => R.concat(arr, offer.propertiesFromB)
            )
        )
    )(playerA);

    const netMoneyToB = offer.moneyFromA - offer.moneyFromB;
    const updatedPlayerB = R.pipe(
        R.over(R.lensProp("money"), R.add(netMoneyToB)),
        R.over(R.lensProp("properties"), R.pipe(
            R.without(offer.propertiesFromB),
            (arr) => R.concat(arr, offer.propertiesFromA)
        ))
    )(playerB);

    const updatePlayers = R.pipe(
        R.adjust(fromIndex, R.always(updatedPlayerA)),
        R.adjust(toIndex, R.always(updatedPlayerB))
    );

    return R.over(R.lensProp("players"), updatePlayers, state);
};

export default Object.freeze(Imperium);
