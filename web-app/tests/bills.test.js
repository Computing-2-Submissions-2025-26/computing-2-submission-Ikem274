import * as R from 'ramda';
import Imperium from '../Imperium.js';
import { throw_if_invalid, display_state } from './TestHelpers.js';

const getBaseState = function () {
    const p1 = { id: 1, name: "P1", emoji: "😎", colour: "#f00", money: 1200, position: 1, properties: [], isBankrupt: false, inGapYear: false, gapYearTurns: 0 };
    const p2 = { id: 2, name: "P2", emoji: "🤖", colour: "#00f", money: 1200, position: 1, properties: [], isBankrupt: false, inGapYear: false, gapYearTurns: 0 };
    let state = Imperium.create_game_state([p1, p2]);
    return R.set(R.lensProp("currentPlayerIndex"), 0, state);
};

describe("Bills Due", function () {
    it(
        `Given a player lands on Bills Due (Tile 3),
        When the landing action is resolved,
        Then they should pay 10% of their money.`,
        function () {
            let state = getBaseState();
            state = R.set(R.lensPath(['players', 0, 'position']), 3, state);
            throw_if_invalid(state);

            const result = Imperium.handle_landing(state);
            throw_if_invalid(result.state);

            const expected_money = Math.floor(1200 * 0.90);
            if (result.state.players[0].money !== expected_money) {
                throw new Error(
                    "Bills Due did not deduct 10% of money correctly: " +
                    display_state(result.state)
                );
            }
        }
    );

    it(
        `Given a player lands on House Rent Due (Tile 27),
        When the landing action is resolved,
        Then they should pay 20% of their money.`,
        function () {
            let state = getBaseState();
            state = R.set(R.lensPath(['players', 0, 'position']), 27, state);

            const result = Imperium.handle_landing(state);

            const expected_money = Math.floor(1200 * 0.80);
            if (result.state.players[0].money !== expected_money) {
                throw new Error(
                    "House Rent Due did not deduct 20% of money correctly: " +
                    display_state(result.state)
                );
            }
        }
    );
});
