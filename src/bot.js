/*-
 * #%L
 * Codenjoy - it's a dojo-like platform from developers to developers.
 * %%
 * Copyright (C) 2018 - 2019 Codenjoy
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/gpl-3.0.html>.
 * #L%
 */
import { ELEMENT, COMMANDS } from './constants';
import {
  isGameOver, getHeadPosition, getElementByXY, getBoardAsArray, isNear, getFirstPositionOf, getXYByPosition,
} from './utils';

const moves = ['LEFT', 'UP', 'RIGHT', 'DOWN'];
// Bot Example
export function getNextSnakeMove(board, logger) {

    if (isGameOver(board)) {
        return '';
    }
    const headPosition = getHeadPosition(board);
    if (!headPosition) {
        return '';
    }
    // logger('Head:' + JSON.stringify(headPosition));

    const sorround = getSorroundCells(headPosition); // (LEFT, UP, RIGHT, DOWN)

    const closestBonusElements = findAllElementCoordinates(board, getTargets(board));
    const target = findClosestElement(headPosition, closestBonusElements);

    // logger('Sorround: ' + JSON.stringify(sorround));
    return combineCellsData(sorround, target, board);
}

function getSorroundCells(position) {
    const p = position;
    return [
        { x: p.x - 1, y: p.y }, // LEFT
        { x: p.x, y: p.y - 1 }, // UP
        { x: p.x + 1, y: p.y }, // RIGHT
        { x: p.x, y: p.y + 1 } // DOWN
    ];
}

function findAllElementCoordinates(board, elements) {
    const result = [];
    for (let i = 0; i < board.length; i++) {
        if (elements.includes(board[i])) {
            result.push(getXYByPosition(board, i));
        }
    }

    return result;
}

function findClosestElement(position, elements) {
    const distanses = elements.map(element => distance(position, element));
    const minDistanse = Math.min.apply(null, distanses);
    const closestElementIndex = distanses.findIndex(distanse => distanse === minDistanse);
    return elements[closestElementIndex];
}

function combineCellsData(sorround, target, board) {
    let cellsData = sorround.map((cell, index) => {
        return {
            distance: distance(cell, target),
            isBarrier: getBarriers(board, cell) === ELEMENT.WALL,
            cellIndex: index,
            element: getElementByXY(board, cell),
        }
    })

    let decision = makeMoove(cellsData);

    return moves[decision.cellIndex];
}

function makeMoove(cellsData) {
    const initialMove = cellsData.find(cell => !cell.isBarrier)

    return cellsData.reduce((min, cell) => {
        if (cell.isBarrier) {
            return initialMove;
        }

        return cell.distance < min.distance ? cell : min;
    }, cellsData[0]);
}

function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function getSnakeLength(board) {
    const bodyParts = findAllElementCoordinates(board, [
        ELEMENT.BODY_HORIZONTAL,
        ELEMENT.BODY_LEFT_DOWN,
        ELEMENT.BODY_LEFT_UP,
        ELEMENT.BODY_VERTICAL,
        ELEMENT.BODY_RIGHT_DOWN,
        ELEMENT.BODY_RIGHT_UP,
    ]);

    return bodyParts.length;
}

function getTargets(board) {
    const snakeLength = getSnakeLength(board);

    if (snakeLength > 5) {
        return [ELEMENT.APPLE, ELEMENT.FLYING_PILL, ELEMENT.FURY_PILL, ELEMENT.GOLD, ELEMENT.STONE];
    }

    return [ELEMENT.APPLE, ELEMENT.FLYING_PILL, ELEMENT.FURY_PILL, ELEMENT.GOLD];
}

function getBarriers(board, cell) {
    let barriers = [
        ELEMENT.WALL,
        // ELEMENT.START_FLOOR,
        ELEMENT.ENEMY_TAIL_END_DOWN,
        ELEMENT.ENEMY_TAIL_END_LEFT,
        ELEMENT.ENEMY_TAIL_END_UP,
        ELEMENT.ENEMY_TAIL_END_RIGHT,
        ELEMENT.ENEMY_TAIL_INACTIVE,
        ELEMENT.ENEMY_BODY_HORIZONTAL,
        ELEMENT.ENEMY_BODY_VERTICAL,
        ELEMENT.ENEMY_BODY_LEFT_DOWN,
        ELEMENT.ENEMY_BODY_LEFT_UP,
        ELEMENT.ENEMY_BODY_RIGHT_DOWN,
        ELEMENT.ENEMY_BODY_RIGHT_UP,
        // ELEMENT.BODY_HORIZONTAL,
        // ELEMENT.BODY_VERTICAL
    ];

    if (getSnakeLength(board) < 5) {
        barriers.push(ELEMENT.STONE);
    }

    console.log(barriers.includes(getElementByXY(board, cell)))
    return barriers.includes(getElementByXY(board, cell));
}

//===================== EXAMPLES
function getSorround(board, position) {
    const p = position;
    return [
        getElementByXY(board, {x: p.x - 1, y: p.y }), // LEFT
        getElementByXY(board, {x: p.x, y: p.y -1 }), // UP
        getElementByXY(board, {x: p.x + 1, y: p.y}), // RIGHT
        getElementByXY(board, {x: p.x, y: p.y + 1 }) // DOWN
    ];
}

function rateElement(element) {
    if (element === ELEMENT.NONE) {
        return 0;
    }
    if (
        element === ELEMENT.APPLE ||
        element === ELEMENT.GOLD
    ) {
        return 1;
    }

    return -1;
}


function getCommandByRaitings(raitings) {
    var indexToCommand = ['LEFT', 'UP', 'RIGHT', 'DOWN'];
    var maxIndex = 0;
    var max = -Infinity;
    for (var i = 0; i < raitings.length; i++) {
        var r = raitings[i];
        if (r > max) {
            maxIndex = i;
            max = r;
        }
    }

    return indexToCommand[maxIndex];
}