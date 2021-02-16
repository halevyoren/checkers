import React, { useState } from "react";

import Square from "../square/Square";
import "./Board.css";

const buildBoard = (squares, squareClickHandler, boardSize) => {
  const board = [];
  let currentRow = [];
  for (var rowNumber = 0; rowNumber < boardSize; rowNumber++) {
    const rowStart = rowNumber * boardSize;
    for (var columnNumber = 0; columnNumber < boardSize; columnNumber++) {
      const squareNumber = rowStart + columnNumber;
      currentRow.push(
        <Square
          key={squareNumber}
          params={squares[squareNumber]}
          // color={squares[squareNumber] ? squares[squareNumber].pawnColor : ""}
          // clicked={squares[squareNumber] ? squares[squareNumber].clicked : ""}
          // readyToMove={false}
          squareColor={
            (rowNumber + columnNumber) % 2 !== 0 ? "blackSquare" : "whiteSquare"
          }
          onClick={squareClickHandler(squareNumber)}
        />
      );
    }

    board.push(
      <div key={rowNumber} className='row'>
        {currentRow}
      </div>
    );
    currentRow = [];
  }
  return board;
};

const Board = ({ squareClickHandler, squares, boardSize }) => {
  return <div>{buildBoard(squares, squareClickHandler, boardSize)}</div>;
};

export default Board;
