import React from "react";

import "./Square.css";

// const Square = ({ color, clicked, squareColor, onClick, isQueen, readyToMove }) => {
const Square = ({ params, squareColor, onClick }) => {
  var color = "";
  var clicked = "";
  if (params) {
    color = params.pawnColor;
    clicked = params.clicked;
  }

  return (
    <button
      onClick={onClick}
      className={`square ${color} ${clicked ? "clicked" : ""} ${squareColor}`}
    >
      <div>{color ? "O" : ""}</div>
    </button>
  );
};

export default Square;
