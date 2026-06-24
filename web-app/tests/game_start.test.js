import assert from 'node:assert';
import R from 'ramda';
import Imperium from '../Imperium.js';

describe('Starting the Game', function () {

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

    it('Given a new game, when it starts, then all players begin on Student Finance (Tile 1) with £1200', function () {
        const players = baseState.players;
        assert.strictEqual(players.length, 2);
        players.forEach(p => {
            assert.strictEqual(p.money, 1200);
            assert.strictEqual(p.position, 1);
        });
    });
});
