import React, { useState, useEffect } from "react";

import Board from "./board/Board";
import "./Game.css";

const makeInitialArr = (boardSize) => {
  let initialArr = [];
  for (var rowNumber = 0; rowNumber < boardSize; rowNumber++) {
    for (var columnNumber = 0; columnNumber < boardSize; columnNumber++) {
      //check if row needs pawns
      if (rowNumber < 3 || rowNumber > boardSize - 4) {
        //check if square needs pawn
        if ((rowNumber + columnNumber) % 2 !== 0)
          initialArr[rowNumber * boardSize + columnNumber] = {
            pawnColor: `${rowNumber < 3 ? "white" : "red"}`,
            clicked: false,
            // readyToMove: false, // if a pawn can be moved to there
          };
      } else if ((rowNumber + columnNumber) % 2 !== 0)
        initialArr[rowNumber * boardSize + columnNumber] = {
          pawnColor: ``,
          clicked: false,
          queen: false,
        };
    }
  }
  return initialArr;
};

const Game = () => {
  //parameters
  const boardSize = 8; // size of rows/columns of board (for example 8x8 or 9x9)
  const initialArr = makeInitialArr(boardSize); // the constent of all sqares on the board of an unplayed game
  const [squares, setSquares] = useState(initialArr); // the constent of all sqares on the board
  const [clickedPawn, setClickedPawn] = useState(-1); // if -1 then no one is clicked else it receives the click square number
  const [redIsNext, setRedIsNext] = useState(true); // is red the next player
  const [moveCounter, setMoveCounter] = useState(0); // how many move have been palyed at all
  const [currentMove, setCurrentMove] = useState(0); // how many move have been palyed to the current play (if we undo a move then its count is dropped by 1)
  const [history, setHistory] = useState([]); //history of game states
  const [lastMovesHistory, setLastMovesHistory] = useState([]); //written history of move (qho played and from where to where)

  useEffect(() => {
    const newHistory = [...history];
    newHistory.push(
      squares.map((square) => {
        if (!square) return square; // white square
        return { ...square, clicked: false };
      })
    );
    setHistory(newHistory);
  }, [moveCounter]);

  //functions
  const squareClickHandler = (squareNumber) => () => {
    if (!squares[squareNumber]) return; //clicked on a white square
    if (
      clickedPawn === -1 &&
      ((redIsNext && squares[squareNumber].pawnColor === "red") ||
        (!redIsNext && squares[squareNumber].pawnColor === "white"))
    ) {
      // clicking on the pawn we want to move, while checking its color and whos turn it is
      const newSquares = [...squares];
      newSquares[squareNumber].clicked = "true";
      //color squares we can move to
      colorSquares(newSquares, squareNumber, "color", "left", "forward");
      colorSquares(newSquares, squareNumber, "color", "right", "forward");
      if (newSquares[squareNumber].queen) {
        colorSquares(newSquares, squareNumber, "color", "left", "backward");
        colorSquares(newSquares, squareNumber, "color", "right", "backward");
      }
      setSquares(newSquares);
      setClickedPawn(squareNumber);
    } else if (clickedPawn === squareNumber) {
      // clicked on the previous click square (unclick it)
      const newSquares = [...squares];
      newSquares[squareNumber].clicked = "";
      colorSquares(newSquares, squareNumber, "unColor", "left", "forward");
      colorSquares(newSquares, squareNumber, "unColor", "right", "forward");
      if (newSquares[squareNumber].queen) {
        colorSquares(newSquares, squareNumber, "unColor", "left", "backward");
        colorSquares(newSquares, squareNumber, "unColor", "right", "backward");
      }
      setClickedPawn(-1);
      setSquares(newSquares);
    } else if (squares[squareNumber].clicked) {
      const newSquares = [...squares];
      movingPawn(squareNumber, "forward", newSquares);
      if (newSquares[clickedPawn].queen)
        movingPawn(squareNumber, "backward", newSquares);

      newSquares[squareNumber] = { ...newSquares[clickedPawn], clicked: "" }; // copying the pawn to its new position
      if (
        (newSquares[squareNumber].pawnColor === "red" &&
          Math.floor((squareNumber / boardSize) % boardSize) === 0) ||
        (newSquares[squareNumber].pawnColor === "white" &&
          Math.floor((squareNumber / boardSize) % boardSize) === boardSize - 1)
      )
        newSquares[squareNumber].queen = true;
      newSquares[clickedPawn] = {
        //emptying the pawn from its previous position
        pawnColor: ``,
        clicked: false,
        queen: false,
      };
      setSquares(newSquares);
      setRedIsNext((prev) => !prev);

      setClickedPawn(-1);
      if (moveCounter !== currentMove) {
        const newHistory = [...history].slice(0, currentMove + 1);
        newHistory.push(
          newSquares.map((square) => {
            return { ...square };
          })
        );
        setHistory(newHistory);
        const newMovesHistory = [...lastMovesHistory].slice(0, currentMove);
        setLastMovesHistory(newMovesHistory);
        setMoveCounter(currentMove + 1);
      } else {
        setMoveCounter((prev) => prev + 1);
      }
      setLastMovesHistory((prev) => [
        ...prev,
        {
          pawnColor: newSquares[squareNumber].pawnColor,
          from: clickedPawn,
          to: squareNumber,
        },
      ]);
      setCurrentMove((prev) => prev + 1);
    }
  };

  const movingPawn = (squareNumber, forwardOrBackwards, newSquares) => {
    // clicked on a blue square we want to move to
    colorSquares(newSquares, clickedPawn, "unColor", "left", "forward");
    colorSquares(newSquares, clickedPawn, "unColor", "right", "forward");
    if (newSquares[clickedPawn].queen) {
      colorSquares(newSquares, clickedPawn, "unColor", "left", "backward");
      colorSquares(newSquares, clickedPawn, "unColor", "right", "backward");
    }
    const squareNumberRowNumber = Math.floor(
      //the row number that was clicked
      (squareNumber / boardSize) % boardSize
    );
    const clickedPawnRowNumber = Math.floor(
      //the row number in which the pawn is in (before the move)
      (clickedPawn / boardSize) % boardSize
    );
    if (
      squareNumberRowNumber ===
      ((newSquares[clickedPawn].pawnColor === "red" &&
        forwardOrBackwards === "forward") ||
      (newSquares[clickedPawn].pawnColor === "white" &&
        forwardOrBackwards === "backward")
        ? clickedPawnRowNumber - 2
        : clickedPawnRowNumber + 2)
    ) {
      //eating the oponent pawn
      let pawnEatingIndex;
      if (
        (newSquares[clickedPawn].pawnColor === "red" &&
          forwardOrBackwards === "forward") ||
        (newSquares[clickedPawn].pawnColor === "white" &&
          forwardOrBackwards === "backward")
      ) {
        //moving a red pawn
        pawnEatingIndex =
          clickedPawn -
          (clickedPawn - squareNumber === 2 * boardSize - 2
            ? boardSize - 1
            : boardSize + 1); //checking if the pawn moved left or right
      } else {
        //moving a white pawn
        pawnEatingIndex =
          squareNumber -
          (squareNumber - clickedPawn === 2 * boardSize - 2
            ? boardSize - 1
            : boardSize + 1); //checking if the pawn moved left or right
      }
      newSquares[pawnEatingIndex] = {
        //emptying the eaten pawn
        pawnColor: ``,
        clicked: false,
        queen: false,
      };
    }
  };

  const colorSquares = (
    newSquares,
    squareNumber,
    colorOrUncolor,
    rightOrLeft,
    forwardOrBackwards
  ) => {
    const nextSquareIndex = getNextSquareToColor(
      squareNumber,
      rightOrLeft,
      newSquares[squareNumber].pawnColor,
      forwardOrBackwards
    );
    const currentSquare = newSquares[squareNumber];
    const nextSquare = newSquares[nextSquareIndex];
    if (!nextSquare) return; // the next square is a white square
    const currentRowNumber = Math.floor((squareNumber / boardSize) % boardSize);
    const nextRowIndex = Math.floor((nextSquareIndex / boardSize) % boardSize);
    if (
      currentRowNumber ===
      ((currentSquare.pawnColor === "red" &&
        forwardOrBackwards === "forward") ||
      (currentSquare.pawnColor === "white" && forwardOrBackwards === "backward")
        ? nextRowIndex + 1
        : nextRowIndex - 1)
      // the square is in the next row (for queen form both sides)
    ) {
      if (!nextSquare.pawnColor)
        // there isn't a pawn there
        nextSquare.clicked = colorOrUncolor === "color" ? true : false;
      else {
        //there is a pawn there
        if (nextSquare.pawnColor === currentSquare.pawnColor) {
          // the pawns are the same color so we cant "eat" the pawn
          return;
        } else {
          const jumpAfterEatingIndex = getNextSquareToColor(
            nextSquareIndex,
            rightOrLeft,
            newSquares[squareNumber].pawnColor,
            forwardOrBackwards
          );
          const afterEatingRowIndex = Math.floor(
            (jumpAfterEatingIndex / boardSize) % boardSize
          );
          const jumpAfterEatingSquare = newSquares[jumpAfterEatingIndex];
          if (!jumpAfterEatingSquare) return; // the next square is a white square
          if (
            Math.floor(
              currentRowNumber ===
                ((currentSquare.pawnColor === "red" &&
                  forwardOrBackwards === "forward") ||
                (currentSquare.pawnColor === "white" &&
                  forwardOrBackwards === "backward")
                  ? afterEatingRowIndex + 2
                  : afterEatingRowIndex - 2)
            )
            // the square is in the next row  (for queen form both sides)
          ) {
            if (!jumpAfterEatingSquare.pawnColor) {
              // there isn't a pawn there
              jumpAfterEatingSquare.clicked =
                colorOrUncolor === "color" ? true : false;
            }
          }
        }
      }
    }
  };

  const getNextSquareToColor = (
    squareNumber,
    rightOrLeft,
    pawnColor,
    forwardOrBackwards
  ) => {
    if (
      (pawnColor === "red" && forwardOrBackwards === "forward") ||
      (pawnColor === "white" && forwardOrBackwards === "backward")
    ) {
      return rightOrLeft === "left"
        ? squareNumber - boardSize - 1
        : squareNumber - boardSize + 1;
    } else {
      return rightOrLeft === "left"
        ? squareNumber + boardSize - 1
        : squareNumber + boardSize + 1;
    }
  };
  const restHandler = () => {
    const initialArr = makeInitialArr(boardSize);
    setSquares(initialArr);
    setClickedPawn(-1); // if -1 then no one is clicked else it receives the click square number
    setRedIsNext(true);
    setMoveCounter(0);
    setCurrentMove(0);
    setHistory([]);
    setLastMovesHistory([]);
  };
  const undoHandler = () => {
    if (currentMove < 1) return;
    setSquares(
      [...history[currentMove - 1]].map((square) => {
        return { ...square, clicked: false };
      })
    );
    setCurrentMove((prev) => prev - 1);
    setRedIsNext((prev) => !prev);
    setClickedPawn(-1);
  };
  const redoHandler = () => {
    if (currentMove >= moveCounter) return;
    setSquares(
      [...history[currentMove + 1]].map((square) => {
        return { ...square, clicked: false };
      })
    );
    setCurrentMove((prev) => prev + 1);
    setRedIsNext((prev) => !prev);
    setClickedPawn(-1);
  };

  const printHistory = () => {
    const printHistory = [];
    for (var i = Math.max(0, currentMove - 10); i < currentMove; i++) {
      const historyItem = lastMovesHistory[i];
      printHistory.push(
        <div
          key={i}
        >{`${historyItem.pawnColor} moved from square ${historyItem.from} to square ${historyItem.to}`}</div>
      );
    }

    return printHistory;
  };

  const findWinner = () => {
    let redPawns = 0;
    let whitePawns = 0;
    const fullBoardSize = boardSize * boardSize;
    for (
      var squareIndex = 0;
      squareIndex < fullBoardSize;
      squareIndex = squareIndex + 1
    ) {
      if (squares[squareIndex]) {
        if (squares[squareIndex].pawnColor === "red") {
          redPawns += 1;
          continue;
        }
        if (squares[squareIndex].pawnColor === "white") {
          whitePawns += 1;
          continue;
        }
      }
    }
    if (redPawns === 0) return "White Player Wins!!!";
    if (whitePawns === 0) return "Red Player Wins!!!";
    return `${redIsNext ? "red" : "white"} is next`;
  };

  const title = findWinner();

  return (
    <div className='game-and-history'>
      <div className='game-area'>
        <div className='board'>
          <h2>{title}</h2>
          <Board
            squares={squares}
            squareClickHandler={squareClickHandler}
            boardSize={boardSize}
          />
          <div className='buttons'>
            <button onClick={undoHandler}>Undo</button>
            <button onClick={redoHandler}>Redo</button>
            <button onClick={restHandler}>Reset</button>
          </div>
        </div>
      </div>
      <div className='history'>
        <h3>last 10 moves</h3>
        {printHistory()}
      </div>
    </div>
  );
};

export default Game;
