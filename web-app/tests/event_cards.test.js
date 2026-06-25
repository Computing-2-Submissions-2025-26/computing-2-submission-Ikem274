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

describe("Event Cards", function () {
    it(
        `Given a player lands on an event tile,
        When they draw an event card that gives them money,
        Then their money should increase by the correct amount.`,
        function () {
            let state = get_base_state();
            // Set player on an event tile
            state.players[0].position = 6;

            // Find a real "gain" card from the gameConfig
            const gainCard = gameConfig.event_cards.find(function (c) {
                return c.effect.type === "gain";
            });
            state.eventDeck = [gainCard];
            state.eventDeckIndex = 0;

            const moneyBefore = state.players[0].money;

            const result = Imperium.handle_landing(state);
            throw_if_invalid(result.state);

            const moneyAfter = result.state.players[0].money;
            const expected = moneyBefore + gainCard.effect.amount;

            if (moneyAfter !== expected) {
                throw new Error("Expected money to be " + expected + " but got " + moneyAfter);
            }
        }
    );

    it(
        `Given a player lands on an event tile,
        When they draw an event card that takes away money,
        Then their money should decrease by the correct amount.`,
        function () {
            let state = get_base_state();

            // Set player on an event tile
            state.players[0].position = 6;

            // Find a real "lose" card from the gameConfig
            const loseCard = gameConfig.event_cards.find(function (c) {
                return c.effect.type === "lose";
            });
            state.eventDeck = [loseCard];
            state.eventDeckIndex = 0;

            const moneyBefore = state.players[0].money;

            const result = Imperium.handle_landing(state);
            throw_if_invalid(result.state);

            const moneyAfter = result.state.players[0].money;
            const expected = moneyBefore - loseCard.effect.amount;

            if (moneyAfter !== expected) {
                throw new Error("Expected money to be " + expected + " but got " + moneyAfter);
            }
        }
    );

    it(
        `Given a player lands on an event tile,
        When they draw a card that moves them to a new tile,
        Then their position should change to the new tile.`,
        function () {
            let state = get_base_state();

            // Set player on an event tile
            state.players[0].position = 6;

            // Find a real "move" card from the gameConfig
            const moveCard = gameConfig.event_cards.find(function (c) {
                return c.effect.type === "move";
            });
            state.eventDeck = [moveCard];
            state.eventDeckIndex = 0;

            const result = Imperium.handle_landing(state);
            throw_if_invalid(result.state);

            const newPosition = result.state.players[0].position;

            if (newPosition !== moveCard.effect.tileId) {
                throw new Error("Expected position to be " + moveCard.effect.tileId + " but got " + newPosition);
            }
        }
    );
});
