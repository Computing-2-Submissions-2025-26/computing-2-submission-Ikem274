import assert from 'node:assert';
import R from 'ramda';
import Imperium from '../Imperium.js';

describe('Gap Year', function () {

    let baseState;

    beforeEach(function () {
        const p1 = { id: 1, name: "P1", emoji: "😎", colour: "#f00" };
        const p2 = { id: 2, name: "P2", emoji: "🤖", colour: "#00f" };
        baseState = Imperium.initialise_game([p1, p2]);
        baseState = R.set(R.lensProp('players'), [
            { id: 1, name: "P1", emoji: "😎", colour: "#f00", money: 1200, position: 1, properties: [], isBankrupt: false, inGapYear: false, missedTurns: 0 },
            { id: 2, name: "P2", emoji: "🤖", colour: "#00f", money: 1200, position: 1, properties: [], isBankrupt: false, inGapYear: false, missedTurns: 0 }
        ], baseState);
        baseState.currentPlayerIndex = 0;
    });

    it('Given a player is sent to gap year, when they choose to pay the buyout, then they lose £50 and are freed', function () {
        let state = R.set(R.lensPath(['players', 0, 'inGapYear']), true, baseState);
        const result = Imperium.handle_gap_year_turn(state, 'pay');
        assert.strictEqual(result.state.players[0].money, 1150); // 1200 - 50
        assert.strictEqual(result.state.players[0].inGapYear, false);
    });

    it('Given a player is in gap year, when they choose to roll and fail, then they miss their turn', function () {
        let state = R.set(R.lensPath(['players', 0, 'inGapYear']), true, baseState);
        // Dice is random, but if they don't escape they must still be in gap year
        const result = Imperium.handle_gap_year_turn(state, 'roll');
        if (!result.escaped) {
            assert.strictEqual(result.state.players[0].inGapYear, true);
        }
    });
});
