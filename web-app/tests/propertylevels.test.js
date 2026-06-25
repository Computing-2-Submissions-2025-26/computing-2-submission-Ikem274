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

describe("Upgrading Properties", function () {
    it(
        `Given a player owns a full property set,
        When they choose to upgrade a property in that set,
        Then their money decreases by the upgrade cost and the property level increases by 1.`,
        function () {
            let state = get_base_state();
            state = R.set(R.lensPath(["players", 0, "properties"]), [2], state); // Huxley
            throw_if_invalid(state);

            const new_state = Imperium.upgrade_property(state, 2);
            throw_if_invalid(new_state);

            const p1 = new_state.players[0];
            const new_level = new_state.propertyLevels["2"];

            // Upgrade cost for Huxley is 75
            if (p1.money !== gameConfig.starting_money - 75 || new_level !== 1) {
                throw new Error(
                    "Upgrading did not deduct correct money or increment the level: " +
                    display_state(new_state)
                );
            }
        });

    it(
        `Given a player does not own the full property set,
        When they attempt to upgrade a property,
        Then the state should remain unchanged.`,
        function () {
            let state = get_base_state();
            state = R.set(R.lensPath(["players", 0, "properties"]), [5], state); // Only Blackett

            const new_state = Imperium.upgrade_property(state, 5);

            if (new_state.players[0].money !== gameConfig.starting_money || new_state.propertyLevels["5"]) {
                throw new Error(
                    "Player was able to upgrade without owning the full set: " +
                    display_state(new_state)
                );
            }
        });
});

describe("Downgrading Properties", function () {
    it(
        `Given a player owns an upgraded property,
        When they choose to sell an upgrade,
        Then their money increases by the sell price and the property level decreases by 1.`,
        function () {
            let state = get_base_state();
            state = R.set(R.lensPath(["players", 0, "properties"]), [2], state); // Huxley
            state = R.set(R.lensPath(["propertyLevels", "2"]), 2, state);
            throw_if_invalid(state);

            const new_state = Imperium.sell_property_upgrade(state, 2);
            throw_if_invalid(new_state);

            const p1 = new_state.players[0];
            if (p1.money !== gameConfig.starting_money + 50 || new_state.propertyLevels["2"] !== 1) {
                throw new Error(
                    "Downgrading did not properly adjust money or property level: " +
                    display_state(new_state)
                );
            }
        }
    );

    it(
        `Given a player owns a property with no upgrades,
        When they attempt to sell an upgrade,
        Then the state should remain unchanged.`,
        function () {
            let state = get_base_state();
            state = R.set(R.lensPath(["players", 0, "properties"]), [2], state);

            const new_state = Imperium.sell_property_upgrade(state, 2);

            if (new_state.players[0].money !== gameConfig.starting_money) {
                throw new Error(
                    "Player was able to sell an upgrade on a level 0 property: " +
                    display_state(new_state)
                );
            }
        }
    );
});