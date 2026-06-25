import * as R from "ramda";
import Imperium from "../Imperium.js";
import gameConfig from "../gameConfig.js";
import { throw_if_invalid, display_state } from "./TestHelpers.js";

const get_base_state = function () {
    const p1 = Imperium.create_player(1, "P1", "😎", "#f00");
    const p2 = Imperium.create_player(2, "P2", "🤖", "#00f");
    let state = Imperium.create_game_state([p1, p2]);
    state = R.set(R.lensProp("firstMove"), false, state);
    return R.set(R.lensProp("currentPlayerIndex"), 0, state);
};

describe("Student Finance", function () {
    it(
        `Given a player is approaching Student Finance,
        When they roll and pass the tile,
        Then they collect the Student Finance money.`,
        function () {
            let state = get_base_state();
            state = R.set(R.lensPath(["players", 0, "position"]), 26, state);
            throw_if_invalid(state);

            const new_state = Imperium.move_player(state, 4);
            throw_if_invalid(new_state);

            if (new_state.players[0].money !== gameConfig.starting_money + gameConfig.student_finance_money) {
                throw new Error(
                    "Player did not collect £200 after passing Student Finance: " +
                    display_state(new_state)
                );
            }
        }
    );

    it(
        `Given a player is approaching Student Finance,
        When they land exactly on it,
        Then they collect the Student Finance money.`,
        function () {
            let state = get_base_state();
            state = R.set(R.lensPath(["players", 0, "position"]), 26, state);

            const steps = Imperium.total_tiles - 26 + 1;
            const new_state = Imperium.move_player(state, steps);

            if (new_state.players[0].money !== gameConfig.starting_money + gameConfig.student_finance_money) {
                throw new Error(
                    "Player did not collect £200 after landing directly on Student Finance: " +
                    display_state(new_state)
                );
            }
        }
    );
});
