import * as R from 'ramda';
import Imperium from '../Imperium.js';
import gameConfig from '../gameConfig.js';
import { throw_if_invalid, display_state } from './TestHelpers.js';

describe("Starting the Game", function () {
    it(
        `Given a list of valid players,
        When a new game is initialized,
        Then the resulting game state is valid and players start with correct defaults.`,
        function () {
            const p1 = Imperium.create_player(1, "P1", "😎", "#f00");
            const p2 = Imperium.create_player(2, "P2", "🤖", "#00f");

            const state = Imperium.create_game_state([p1, p2]);
            throw_if_invalid(state);

            if (state.players.length !== 2) {
                throw new Error("Initial state has incorrect player count: " + display_state(state));
            }

            const valid_starts = R.all(
                (p) => p.money === gameConfig.starting_money && p.position === gameConfig.student_finance_tile && p.properties.length === 0,
                state.players
            );

            if (!valid_starts) {
                throw new Error("Players did not start with proper money or positions: " + display_state(state));
            }
        }
    );

    it(
        `Given a new game,
        When initialized,
        Then round 1 starts with the first player and rolling phase.`,
        function () {
            const p1 = Imperium.create_player(1, "P1", "😎", "#f00");
            const state = Imperium.create_game_state([p1]);

            if (state.round !== 1 || state.phase !== "roll" || state.currentPlayerIndex !== 0) {
                throw new Error("Game did not initialize to the first turn: " + display_state(state));
            }
        }
    );
});
