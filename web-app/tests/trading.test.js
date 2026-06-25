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

describe("Trading", function () {
    it(
        `Given two players and a valid trade offer,
        When the trade is executed,
        Then money and properties are exchanged and the total economy remains balanced.`,
        function () {
            let state = get_base_state();
            state = R.set(R.lensPath(["players", 0, "properties"]), [2], state); // P1 owns Huxley
            state = R.set(R.lensPath(["players", 1, "properties"]), [4], state); // P2 owns Westbound
            throw_if_invalid(state);

            const offer = {
                moneyFromA: 100,
                moneyFromB: 0,
                propertiesFromA: [2],
                propertiesFromB: [4]
            };

            const new_state = Imperium.execute_trade(state, 0, 1, offer);
            throw_if_invalid(new_state);

            const p1 = new_state.players[0];
            const p2 = new_state.players[1];

            if (p1.money !== gameConfig.starting_money - 100 || !p1.properties.includes(4)) {
                throw new Error("Player 1 trade assets were incorrectly managed: " + display_state(new_state));
            }

            if (p2.money !== gameConfig.starting_money + 100 || !p2.properties.includes(2)) {
                throw new Error("Player 2 trade assets were incorrectly managed: " + display_state(new_state));
            }
        }
    );

    it(
        `Given a trade offer where a player offers properties they do not own,
        When the trade is executed,
        Then it should fail and return undefined.`,
        function () {
            let state = get_base_state();
            state = R.set(R.lensPath(["players", 0, "properties"]), [2], state);

            const offer = {
                moneyFromA: 0,
                moneyFromB: 0,
                propertiesFromA: [4], // P1 does not own Westbound
                propertiesFromB: []
            };

            const new_state = Imperium.execute_trade(state, 0, 1, offer);

            if (new_state !== undefined) {
                throw new Error("Invalid trade was allowed to process: " + display_state(new_state));
            }
        }
    );
});
