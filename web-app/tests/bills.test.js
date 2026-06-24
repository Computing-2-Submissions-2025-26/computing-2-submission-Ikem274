import assert from 'node:assert';
import R from 'ramda';
import Imperium from '../Imperium.js';

describe('Bills Due', function () {

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

    it('Given a player lands on Bills Due (Tile 3), when the action is resolved, then they pay 10% of their money', function () {
        let state = R.set(R.lensPath(['players', 0, 'position']), 3, baseState);
        const newState = Imperium.handle_bills(state);
        assert.strictEqual(newState.players[0].money, 1080); // 1200 - 120
    });

    it('Given a player lands on Rent Due (Tile 27), when the action is resolved, then they pay 20% of their money', function () {
        let state = R.set(R.lensPath(['players', 0, 'position']), 27, baseState);
        const newState = Imperium.handle_bills(state);
        assert.strictEqual(newState.players[0].money, 960); // 1200 - 240
    });
});
