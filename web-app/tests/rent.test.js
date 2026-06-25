import * as R from 'ramda';
import Imperium from '../Imperium.js';
import { throw_if_invalid, display_state } from './TestHelpers.js';

const get_base_state = function () {
    const p1 = { id: 1, name: "P1", emoji: "😎", colour: "#f00", money: 1200, position: 1, properties: [], isBankrupt: false, inGapYear: false, gapYearTurns: 0 };
    const p2 = { id: 2, name: "P2", emoji: "🤖", colour: "#00f", money: 1200, position: 1, properties: [], isBankrupt: false, inGapYear: false, gapYearTurns: 0 };
    let state = Imperium.create_game_state([p1, p2]);
    return R.set(R.lensProp("currentPlayerIndex"), 0, state);
};

const throw_if_rent_incorrect = function (old_state, new_state, expected_rent) {
    const old_p1 = old_state.players[0];
    const old_p2 = old_state.players[1];
    const new_p1 = new_state.players[0];
    const new_p2 = new_state.players[1];

    if (new_p1.money !== old_p1.money - expected_rent || new_p2.money !== old_p2.money + expected_rent) {
        throw new Error(
            `Rent of ${expected_rent} was not properly transferred between players: ` +
            display_state(new_state)
        );
    }
};

describe("Paying Rent", function () {
    it(
        `Given a game state where Player 1 is on a property owned by Player 2,
        When the owner does not have a full set,
        Then base rent is deducted from Player 1 and added to Player 2.`,
        function () {
            let state = get_base_state();
            state = R.set(R.lensPath(['players', 1, 'properties']), [5], state); // Blackett
            state = R.set(R.lensPath(['players', 0, 'position']), 5, state);
            throw_if_invalid(state);

            const new_state = Imperium.pay_rent(state, 0, 1, 6);
            throw_if_invalid(new_state);
            throw_if_rent_incorrect(state, new_state, 6);
        }
    );

    it(
        `Given a game state where Player 1 is on a property owned by Player 2,
        When the owner has a full set,
        Then double the base rent is deducted from Player 1 and added to Player 2.`,
        function () {
            let state = get_base_state();
            state = R.set(R.lensPath(['players', 1, 'properties']), [5, 7], state); // Light Blue set
            state = R.set(R.lensPath(['players', 0, 'position']), 5, state);

            const expected_rent = Imperium.calculate_rent(state, 5, state.players[1]);
            if (expected_rent !== 12) {
                throw new Error(
                    "Rent calculation for full set failed. Expected 12, got " + expected_rent +
                    display_state(state)
                );
            }

            const new_state = Imperium.pay_rent(state, 0, 1, expected_rent);
            throw_if_rent_incorrect(state, new_state, 12);
        }
    );

    it(
        `Given a game state where Player 1 is on their own property,
When the landing action is resolved,
Then they should pay no rent and the state remains unchanged.`,
        function () {
            let state = get_base_state();
            state = R.set(R.lensPath(['players', 0, 'properties']), [5], state);
            state = R.set(R.lensPath(['players', 0, 'position']), 5, state);

            const result = Imperium.handle_landing(state);

            if (result.action.type !== "property_owned_self" || result.state.players[0].money !== 1200) {
                throw new Error(
                    "Player was charged rent for their own property: " +
                    display_state(result.state)
                );
            }
        }
    );
});
