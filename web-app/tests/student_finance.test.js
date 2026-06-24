import assert from 'node:assert';
import R from 'ramda';
import Imperium from '../Imperium.js';

describe('Student Finance', function () {

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

    it('Given a player on Tile 26, when they roll a 4, then they pass Student Finance and collect £200', function () {
        let state = R.set(R.lensPath(['players', 0, 'position']), 26, baseState);
        state = R.set(R.lensPath(['players', 0, 'money']), 1200, state);
        const newState = Imperium.move_player(state, 4); // 26 + 4 = 30 -> Tile 2 (passes 28)
        assert.strictEqual(newState.players[0].position, 2);
        assert.strictEqual(newState.players[0].money, 1400); // 1200 + 200
    });

    it('Given a player, when they land exactly on Student Finance, then they collect £200', function () {
        let state = R.set(R.lensPath(['players', 0, 'position']), 26, baseState);
        const newState = Imperium.move_player(state, 3); // 26 + 3 = 29 -> Tile 1
        assert.strictEqual(newState.players[0].position, 1);
        assert.strictEqual(newState.players[0].money, 1400);
    });
});
