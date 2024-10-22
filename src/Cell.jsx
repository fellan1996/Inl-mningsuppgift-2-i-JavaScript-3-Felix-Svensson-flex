import React from "react";

function Cell({ cell, onClick, gameOver, youWon }) {
  return (
    <button
      className={`cell${cell.visible ? " visible" : ""}${
        gameOver ? " gameOver" : ""
      }${youWon ? " youWon" : ""}`}
      style={{ width: "80px", height: "80px" }}
      onClick={onClick}
      value={cell.index}
    >
      {cell.visible
        ? cell.hasMine
          ? "💣"
          : cell.numberOfNeighbouringMines
        : cell.flagged
        ? "🚩"
        : ""}
    </button>
  );
}

export default Cell;
//'🚩'
