import * as R from "ramda";
import Imperium from "../Imperium.js";
import gameConfig from "../gameConfig.js";
import { throw_if_invalid, display_state } from "./TestHelpers.js";

const get_base_state = function () {
    const p1 = Imperium.create_player(1, "P1", "😎", "#f00");
    const p2 = Imperium.create_player(2, "P2", "🤖", "#00f");
    let state = Imperium.create_game_state([p1, p2]);
    return R.set(R.lensProp("currentPlayerIndex"), 0, state);
};

describe("Gap Year", function () {
    it(
        `Given a player is sent to Gap Year,
        When they choose to pay the buyout,
        Then their money decreases by the buyout amount and they are freed.`,
        function () {
            let state = get_base_state();
            state = R.set(R.lensPath(["players", 0, "inGapYear"]), true, state);
            throw_if_invalid(state);

            const result = Imperium.handle_gap_year_turn(state, "pay");
            throw_if_invalid(result.state);

            const p1 = result.state.players[0];
            if (p1.money !== gameConfig.starting_money - gameConfig.gap_year_buyout || p1.inGapYear !== false) {
                throw new Error(
                    "Paying gap year buyout did not deduct money or free the player: " +
                    display_state(result.state)
                );
            }
        }
    );

    it(
        `Given a player is in Gap Year,
        When they choose to roll and fail to escape,
        Then their gap year turns increase and they remain in Gap Year.`,
        function () {
            let state = get_base_state();
            state = R.set(R.lensPath(["players", 0, "inGapYear"]), true, state);
            state = R.set(R.lensPath(["players", 0, "gapYearTurns"]), 0, state);

            const originalRandom = Math.random;
            // Force a dice roll of 1 (assuming escape number is 6)
            Math.random = function() { return 0; };

            const result = Imperium.handle_gap_year_turn(state, "roll");

            Math.random = originalRandom;

            if (result.escaped) {
                throw new Error("Expected to fail the roll but escaped: " + display_state(result.state));
            }

            const p1 = result.state.players[0];
            if (p1.inGapYear !== true || p1.gapYearTurns !== 1) {
                throw new Error(
                    "Failing a gap year roll did not properly retain the player: " +
                    display_state(result.state)
                );
            }
        }
    );
});
