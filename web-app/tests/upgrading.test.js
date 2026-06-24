import assert from 'node:assert';
import R from 'ramda';
import Imperium from '../Imperium.js';

describe('Upgrading Properties', function () {

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

    it('Given a player owns a full colour set, when they choose to upgrade, then money is deducted and the property level increases', function () {
        // P1 owns Brown set (2, 4)
        let state = R.set(R.lensPath(['players', 0, 'properties']), [2, 4], baseState);
        state = R.set(R.lensProp('phase'), 'landed', state);

        const newState = Imperium.upgrade_property(state, 2);
        // Upgrade cost for Brown is 50
        assert.strictEqual(newState.players[0].money, 1200 - 50);
        assert.strictEqual(newState.propertyLevels[2], 1);
    });
});
