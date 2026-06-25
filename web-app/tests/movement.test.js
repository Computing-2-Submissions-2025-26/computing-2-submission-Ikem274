import * as R from 'ramda';
import Imperium from '../Imperium.js';
import gameConfig from '../gameConfig.js';
import { throw_if_invalid, display_state } from './TestHelpers.js';

const get_base_state = function () {
    const p1 = Imperium.create_player(1, "P1", "😎", "#f00");
    const p2 = Imperium.create_player(2, "P2", "🤖", "#00f");
    let state = Imperium.create_game_state([p1, p2]);
    return R.set(R.lensProp("currentPlayerIndex"), 0, state);
};

describe("Taking a Turn & Movement", function () {
    it(
        `Given a player is on the board,
        When they move a specific number of steps,
        Then their new position is calculated correctly, wrapping around if necessary.`,
        function () {
            let state = get_base_state();

            const new_state = Imperium.move_player(state, 5);
            throw_if_invalid(new_state);

            if (new_state.players[0].position !== 6 || new_state.phase !== 'landed') {
                throw new Error(
                    "Player did not move to the expected position or update phase: " +
                    display_state(new_state)
                );
            }
        }
    );

    it(
        `Given a player is near the end of the board,
        When they move past the last tile,
        Then their position wraps around to the beginning correctly.`,
        function () {
            let state = get_base_state();
            state = R.set(R.lensPath(['players', 0, 'position']), 26, state);

            const new_state = Imperium.move_player(state, 4); // Lands on tile 2

            if (new_state.players[0].position !== 2) {
                throw new Error(
                    "Player did not wrap around the board correctly: " +
                    display_state(new_state)
                );
            }
        }
    );
});
