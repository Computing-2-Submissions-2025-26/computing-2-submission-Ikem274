import assert from 'node:assert';
import R from 'ramda';
import Imperium from '../Imperium.js';

describe('Taking a Turn & Movement', function () {

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

    it('Given a player on Tile 1, when they roll a 5, then they land on Tile 6 (Event Card)', function () {
        const newState = Imperium.move_player(baseState, 5);
        assert.strictEqual(newState.players[0].position, 6);
        assert.strictEqual(newState.phase, 'landed');
    });
});
