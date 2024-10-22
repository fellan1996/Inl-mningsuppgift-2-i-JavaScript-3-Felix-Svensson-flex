import React, { useState, useEffect } from "react";
import createBoard from "./utils"; // Import your utility function
import Cell from "./Cell"; // Import the Cell component
import ToggleThemeBtn from "./ToggleThemeBtn";

function Board() {
  const [board, setBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [youWon, setYouWon] = useState(false);
  const boardSize = 25;
  const numberOfMines = 7;
  const rowSize = Math.sqrt(boardSize);

  useEffect(() => {
    // Initialize the board when the component mounts
    if (board.length === 0) {
      const newBoard = createBoard(boardSize, numberOfMines);
      setBoard(newBoard);
    }
  }, []);

  const calculateNeighbours = (clickedIndex) => {
    // Base conditions
    if (board[clickedIndex].visible || board[clickedIndex].hasMine) {
      return null;
    }

    const rows = Math.sqrt(boardSize); // Calculate number of rows
    const cols = rows; // Since it's a square grid, cols = rows
    const neighbors = [];

    // Calculate row and column of the clicked index
    const row = Math.floor(clickedIndex / cols);
    const col = clickedIndex % cols;

    // Define possible directions to check (8 possible directions)
    const directions = [
      [-1, -1], // Top-left
      [-1, 0], // Top
      [-1, 1], // Top-right
      [0, -1], // Left
      [0, 1], // Right
      [1, -1], // Bottom-left
      [1, 0], // Bottom
      [1, 1], // Bottom-right
    ];

    // Track which cells should be updated
    const newBoard = [...board];

    // Helper function to process neighbors
    const processNeighbor = (newIndex) => {
      if (newBoard[newIndex].hasMine || newBoard[newIndex].visible) {
        return;
      }
      if (newBoard[newIndex].numberOfNeighbouringMines < 2) {
        newBoard[newIndex] = { ...newBoard[newIndex], visible: true };
        neighbors.push(newIndex); // Recursive call
      }
    };

    // Check each direction
    directions.forEach(([dRow, dCol]) => {
      const newRow = row + dRow;
      const newCol = col + dCol;

      // Check if the new row and column are within bounds
      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
        const newIndex = newRow * cols + newCol;
        processNeighbor(newIndex);
      }
    });

    // After processing all neighbors, update the board state once
    setBoard(newBoard);

    return neighbors;
  };

  const handleClick = ({ target }) => {
    const neighboringCells = calculateNeighbours(target.value);
    console.log(neighboringCells);
    if (!board[target.value].flagged && !gameOver) {
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        newBoard[target.value] = { ...newBoard[target.value], visible: true };
        return newBoard;
      });
      if (board[target.value].hasMine) {
        setGameOver(true);
      }
    }
  };
  useEffect(() => {
    if (gameOver && !document.querySelector("h4")) {
      const boardDiv = document.querySelector(".board");
      const gameOverHeadline = document.createElement("h4");
      gameOverHeadline.innerHTML = "Game Over!";
      boardDiv.before(gameOverHeadline);
    }
  }, [gameOver]);
  useEffect(() => {
    if (
      board.filter(
        (cellInfo) => cellInfo.visible === true || cellInfo.hasMine === true
      ).length === boardSize &&
      !document.querySelector("h4")
    ) {
      const boardDiv = document.querySelector(".board");
      const youWonHeadline = document.createElement("h4");
      youWonHeadline.innerHTML = "You did it!";
      boardDiv.before(youWonHeadline);
      setYouWon(true);
    }
  }, [board]);

  const handleRightClick = (event) => {
    event.preventDefault();
    const cellIndex = event.target.value;
    if (cellIndex && !gameOver) {
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        newBoard[cellIndex] = {
          ...newBoard[cellIndex],
          flagged: !prevBoard[cellIndex].flagged,
        };
        return newBoard;
      });
    }
  };

  return (
    <>
      <ToggleThemeBtn />
      <div
        className="board"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${rowSize}, 1fr)`,
          gap: "1px",
          disabled: "true",
        }}
        onContextMenu={handleRightClick}
      >
        {board.map((cell) => (
          <Cell
            key={cell.index}
            cell={cell}
            onClick={handleClick}
            gameOver={gameOver}
            youWon={youWon}
          />
        ))}
      </div>
    </>
  );
}

export default Board;
