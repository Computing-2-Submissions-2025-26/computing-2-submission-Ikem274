import * as R from 'ramda';
import Imperium from '../Imperium.js';
import { throw_if_invalid, display_state } from './TestHelpers.js';

const getBaseState = function () {
    const p1 = { id: 1, name: "P1", emoji: "😎", colour: "#f00", money: 1200, position: 1, properties: [], isBankrupt: false, inGapYear: false, gapYearTurns: 0 };
    const p2 = { id: 2, name: "P2", emoji: "🤖", colour: "#00f", money: 1200, position: 1, properties: [], isBankrupt: false, inGapYear: false, gapYearTurns: 0 };
    let state = Imperium.create_game_state([p1, p2]);
    return R.set(R.lensProp("currentPlayerIndex"), 0, state);
};

describe("Buying Properties", function () {
    it(
        `Given a player is on an unowned property tile,
        When they choose to buy it,
        Then their money is reduced by the price and they gain the property.`,
        function () {
            let state = getBaseState();
            state = R.set(R.lensPath(['players', 0, 'position']), 2, state); // Huxley
            throw_if_invalid(state);

            const newState = Imperium.buy_property(state);
            throw_if_invalid(newState);

            const player = newState.players[0];
            if (player.money !== 1200 - 150 || !player.properties.includes(2)) {
                throw new Error(
                    "Player did not pay correctly or did not receive the property: " +
                    display_state(newState)
                );
            }
        }
    );

    it(
        `Given a player is on an unowned property tile but has insufficient funds,
        When they attempt to buy it,
        Then the state should remain unchanged.`,
        function () {
            let state = getBaseState();
            state = R.set(R.lensPath(['players', 0, 'position']), 2, state);
            state = R.set(R.lensPath(['players', 0, 'money']), 10, state);

            const new_state = Imperium.buy_property(state);

            if (new_state.players[0].properties.includes(2)) {
                throw new Error(
                    "Player acquired property despite insufficient funds: " +
                    display_state(new_state)
                );
            }
        }
    );
});
