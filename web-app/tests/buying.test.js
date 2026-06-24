import assert from 'node:assert';
import R from 'ramda';
import Imperium from '../Imperium.js';

describe('Buying Properties', function () {

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

    it('Given a player on an unowned property, when they choose to buy it, then they lose money and gain the property', function () {
        // Huxley (Tile 2), Price: 60
        let state = R.set(R.lensPath(['players', 0, 'position']), 2, baseState);
        state = R.set(R.lensProp('phase'), 'landed', state);

        const newState = Imperium.buy_property(state);
        assert.strictEqual(newState.players[0].money, 1200 - 60);
        assert.ok(newState.players[0].properties.includes(2));
    });
});
