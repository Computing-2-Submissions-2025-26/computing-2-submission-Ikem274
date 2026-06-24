import assert from 'node:assert';
import R from 'ramda';
import Imperium from '../Imperium.js';

describe('Trading System', function () {

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

    it('Given two players, when P1 offers money for P2s property, then the trade executes and ownership updates', function () {
        // P2 owns tile 2
        let state = R.set(R.lensPath(['players', 1, 'properties']), [2], baseState);

        const offer = {
            moneyFromA: 200,
            moneyFromB: 0,
            propertiesFromA: [],
            propertiesFromB: [2]
        };

        const newState = Imperium.execute_trade(state, 0, 1, offer);
        assert.notStrictEqual(newState, null);
        assert.strictEqual(newState.players[0].money, 1000); // 1200 - 200
        assert.ok(newState.players[0].properties.includes(2));
        assert.strictEqual(newState.players[1].money, 1400); // 1200 + 200
        assert.ok(!newState.players[1].properties.includes(2));
    });

    it('Given two players, when P1 offers more money than they have, then the trade fails', function () {
        const offer = {
            moneyFromA: 5000, // Has 1200
            moneyFromB: 0,
            propertiesFromA: [],
            propertiesFromB: []
        };
        const newState = Imperium.execute_trade(baseState, 0, 1, offer);
        assert.strictEqual(newState, null);
    });
});
