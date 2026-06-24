import assert from 'node:assert';
import R from 'ramda';
import Imperium from '../Imperium.js';

describe('Downgrading Properties', function () {

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

    it('Given a player owns an upgraded property, when they choose to downgrade, then they receive the sell price and the level decreases', function () {
        let state = R.set(R.lensPath(['propertyLevels', 2]), 1, baseState);
        state = R.set(R.lensProp('phase'), 'landed', state);

        const newState = Imperium.sell_property_upgrade(state, 2);
        // Sell price for Brown is 25
        assert.strictEqual(newState.players[0].money, 1200 + 25);
        assert.strictEqual(newState.propertyLevels[2], 0);
    });
});
