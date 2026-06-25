import * as R from 'ramda';
import Imperium from '../Imperium.js';
import { throw_if_invalid, display_state } from './TestHelpers.js';

const get_base_state = function () {
    const p1 = { id: 1, name: "P1", emoji: "😎", colour: "#f00", money: 1200, position: 1, properties: [], isBankrupt: false, inGapYear: false, gapYearTurns: 0 };
    const p2 = { id: 2, name: "P2", emoji: "🤖", colour: "#00f", money: 1200, position: 1, properties: [], isBankrupt: false, inGapYear: false, gapYearTurns: 0 };
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
            state = R.set(R.lensPath(['players', 0, 'inGapYear']), true, state);
            throw_if_invalid(state);

            const result = Imperium.handle_gap_year_turn(state, 'pay');
            throw_if_invalid(result.state);

            const p1 = result.state.players[0];
            if (p1.money !== 1150 || p1.inGapYear !== false) {
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
            state = R.set(R.lensPath(['players', 0, 'inGapYear']), true, state);
            state = R.set(R.lensPath(['players', 0, 'gapYearTurns']), 0, state);

            const result = Imperium.handle_gap_year_turn(state, 'roll');

            if (!result.escaped) {
                const p1 = result.state.players[0];
                if (p1.inGapYear !== true || p1.gapYearTurns !== 1) {
                    throw new Error(
                        "Failing a gap year roll did not properly retain the player: " +
                        display_state(result.state)
                    );
                }
            }
        }
    );
});
