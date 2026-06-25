import * as R from 'ramda';
import Imperium from '../Imperium.js';

const DISPLAY_MODE = "to_string";

export const display_functions = {
    "json": JSON.stringify,
    "to_string": function (state) {
        let out = `Round: ${state.round} | Phase: ${state.phase} | Current Player: ${state.currentPlayerIndex}\n`;
        out += "Players:\n";
        state.players.forEach(p => {
            out += `  [${p.id}] ${p.name} (${p.emoji}) - Money: £${p.money} | Pos: ${p.position} | Props: [${p.properties.join(',')}] | Bankrupt: ${p.isBankrupt} | GapYear: ${p.inGapYear}\n`;
        });
        if (state.propertyLevels && Object.keys(state.propertyLevels).length > 0) {
            out += `Property Levels: ${JSON.stringify(state.propertyLevels)}\n`;
        }
        return out;
    }
};

export const display_state = function (state) {
    try {
        return "\n" + display_functions[DISPLAY_MODE](state);
    } catch (ignore) {
        return "\n" + JSON.stringify(state);
    }
};

/**
 * Returns if the board is in a valid state.
 * A state is valid if all the following are true:
 * - state is an object
 * - players is an array with valid players
 * - Each player has money > 0 (unless bankrupt), position between 1 and total_tiles
 * - Property ownership is not duplicated
 * - Property levels are between 0 and 3
 * @param {GameState} state The state to test.
 * @throws if the state fails any of the above conditions.
 */
export const throw_if_invalid = function (state) {
    if (!state || typeof state !== 'object') {
        throw new Error("The state is not an object: " + display_state(state));
    }

    if (!Array.isArray(state.players)) {
        throw new Error("The players array is missing or invalid: " + display_state(state));
    }

    if (state.currentPlayerIndex < 0 || state.currentPlayerIndex >= state.players.length) {
        throw new Error(`Current player index out of bounds (${state.currentPlayerIndex}): ` + display_state(state));
    }

    const totalTiles = Imperium.total_tiles || 28;

    let ownedProperties = new Set();

    state.players.forEach(player => {
        if (typeof player.money !== 'number' || isNaN(player.money)) {
            throw new Error(`Player ${player.id} has invalid money: ` + display_state(state));
        }
        if (player.position < 1 || player.position > totalTiles) {
            throw new Error(`Player ${player.id} has invalid position (${player.position}): ` + display_state(state));
        }

        player.properties.forEach(propId => {
            if (ownedProperties.has(propId)) {
                throw new Error(`Property ${propId} is owned by multiple players: ` + display_state(state));
            }
            ownedProperties.add(propId);
        });
    });

    if (state.propertyLevels) {
        for (const [propId, level] of Object.entries(state.propertyLevels)) {
            if (level < 0 || level > 3) {
                throw new Error(`Property ${propId} has invalid level (${level}): ` + display_state(state));
            }
            if (!ownedProperties.has(Number(propId))) {
                throw new Error(`Property ${propId} has an upgrade but is unowned: ` + display_state(state));
            }
        }
    }
};
