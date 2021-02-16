import React from "react";

import "./Square.css";

// const Square = ({ color, clicked, squareColor, onClick, isQueen, readyToMove }) => {
const Square = ({ params, squareColor, onClick }) => {
  var color = "";
  var clicked = "";
  var readyToMove = "";
  if (params) {
    color = params.pawnColor;
    clicked = params.clicked;
    readyToMove = params.readyToMove;
  }

  return (
    <button
      onClick={onClick}
      className={`square ${color} ${clicked ? "clicked" : ""} ${
        readyToMove ? "ready-to-move" : ""
      } ${squareColor}`}
    >
      <div>{color ? "O" : ""}</div>
    </button>
  );
};

export default Square;
