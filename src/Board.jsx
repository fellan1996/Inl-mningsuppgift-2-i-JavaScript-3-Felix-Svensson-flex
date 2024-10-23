import React, { useState, useEffect } from "react";
import createBoard from "./utils"; // Import your utility function
import Cell from "./Cell"; // Import the Cell component
import ToggleThemeBtn from "./ToggleThemeBtn";

function Board() {
  const [board, setBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [youWon, setYouWon] = useState(false);
  const boardSize = 25;
  const numberOfMines = 3;
  const rowSize = Math.sqrt(boardSize);

  useEffect(() => {
    // Initialize the board when the component mounts
    if (board.length === 0) {
      const newBoard = createBoard(boardSize, numberOfMines);
      setBoard(newBoard);
    }
  }, []);

  const calculateIndexesToTurnVisible = (clickedIndexes) => {
    let clickedIndex;
    const neighboringCellIndexesThatAreZeroes = [];
    if(Array.isArray(clickedIndexes)){
      const tempArr = [...clickedIndexes];
      clickedIndex = tempArr.shift();
      tempArr.forEach(index => neighboringCellIndexesThatAreZeroes.push(index));
      
    }else if(typeof clickedIndexes === "number") {
      clickedIndex = clickedIndexes;
    }else {
      console.error("no type match");
      return;
    }
    const cellIndexesToTurnVisible = [clickedIndex];
    if (board[clickedIndex].visible || board[clickedIndex].hasMine) {
      const temporaryBoard = [...board];
      temporaryBoard[clickedIndex] = { ...temporaryBoard[clickedIndex], visible: true };
      setBoard(temporaryBoard);
      return;
    }
    const rows = Math.sqrt(boardSize); // Calculate number of rows
    const columns = rows; // Since it's a square grid, columns = rows
    const clickedOnAZero = board[clickedIndex].numberOfNeighbouringMines === 0;

    // Calculate row and column of the clicked index
    const row = Math.floor(clickedIndex / columns);
    const column = clickedIndex % columns;

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

    const processNeighbor = (neighbourIndex) => {
      const addToListIfAllIsCorrect = (index) => {
        const ItIsAlreadyVisible = board[index].visible;
        const ItHasAMine = board[index].hasMine;
  
        if (ItHasAMine || ItIsAlreadyVisible) {
          //don't continue the cycle and dont make it visible
        } else {
          cellIndexesToTurnVisible.push(index);
        }
      }
      const neighbourIndexIsAZero =
        board[neighbourIndex].numberOfNeighbouringMines === 0;
      addToListIfAllIsCorrect(neighbourIndex);
      if (neighbourIndexIsAZero) {
        console.log("it is a zero");
        //continue the cycle
        neighboringCellIndexesThatAreZeroes.push(neighbourIndex);
      }
    };

    if (clickedOnAZero) {
      // Check each direction
      directions.forEach(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = column + dCol;

        // Check if the new row and column are within bounds
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < columns) {
          const newIndex = newRow * columns + newCol;
          processNeighbor(newIndex);
        }
      });
    }
    const temporaryBoard = [...board];
    cellIndexesToTurnVisible.forEach((index) => {
      temporaryBoard[index] = { ...temporaryBoard[index], visible: true };
    });
    setBoard(temporaryBoard);
    if(neighboringCellIndexesThatAreZeroes.length === 0) {
      //no need to do anything else
      return;
    }
    //if there are indexes in that array then recursion needs to happen
    // calculateIndexesToTurnVisible(neighboringCellIndexesThatAreZeroes[0])
    return;
  };

  const handleClick = ({ target }) => {
    if (!board[target.value].flagged && !gameOver) {
      calculateIndexesToTurnVisible(
        parseInt(target.value)
      );
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
      board.filter((cellInfo) => cellInfo.flagged && cellInfo.hasMine)
        .length === numberOfMines &&
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
