import assert from 'node:assert';
import R from 'ramda';
import Imperium from '../Imperium.js';

describe('Paying Rent', function () {

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

    it('Given a player lands on an owned property, when the owner does not have a full set, then base rent is paid', function () {
        // P2 owns Huxley (Tile 2, Rent: 2)
        let state = R.set(R.lensPath(['players', 1, 'properties']), [2], baseState);
        state = R.set(R.lensPath(['players', 0, 'position']), 2, state);

        const newState = Imperium.pay_rent(state, 2);
        assert.strictEqual(newState.players[0].money, 1200 - 2);
        assert.strictEqual(newState.players[1].money, 1200 + 2);
    });

    it('Given a player lands on an owned property, when the owner HAS a full set, then double base rent is paid', function () {
        // P2 owns Huxley (2) and Westbound (4) (Brown set)
        let state = R.set(R.lensPath(['players', 1, 'properties']), [2, 4], baseState);
        state = R.set(R.lensPath(['players', 0, 'position']), 2, state);

        const newState = Imperium.pay_rent(state, 2);
        assert.strictEqual(newState.players[0].money, 1200 - 4); // Rent 2 * 2 = 4
    });

    it('Given a player lands on their own property, when rent is calculated, then no rent is paid', function () {
        let state = R.set(R.lensPath(['players', 0, 'properties']), [2], baseState);
        state = R.set(R.lensPath(['players', 0, 'position']), 2, state);
        const rent = Imperium.calculate_rent(state, 2);
        assert.strictEqual(rent, 0);
    });
});
