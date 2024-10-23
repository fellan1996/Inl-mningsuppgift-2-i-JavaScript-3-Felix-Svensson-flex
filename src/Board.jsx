import React, { useState, useEffect, useRef } from "react";
import createBoard from "./utils"; // Import your utility function
import Cell from "./Cell"; // Import the Cell component
import ToggleThemeBtn from "./ToggleThemeBtn";

function Board() {
  const boardSize = 25;
  const numberOfMines = 3;
  const [board, setBoard] = useState(() => createBoard(boardSize, numberOfMines));
  const fasterUpdatingBoard = useRef([...board]);
  const [gameOver, setGameOver] = useState(false);
  const [youWon, setYouWon] = useState(false);
  const rowSize = Math.sqrt(boardSize);

  const calculateIndexesToTurnVisible = (clickedIndexes) => {
    const addToListIfAllIsCorrect = (index) => {
      let turnedVisible = false;
      const ItIsAlreadyVisible = fasterUpdatingBoard.current[index].visible;
      const ItHasAMine = fasterUpdatingBoard.current[index].hasMine;

      if (ItHasAMine || ItIsAlreadyVisible) {
        //don't continue the cycle and dont make it visible
      } else {
        turnedVisible = true;
        const updatedCell = { ...fasterUpdatingBoard.current[index], visible: true };
        fasterUpdatingBoard.current[index] = updatedCell;
        setBoard(fasterUpdatingBoard.current);
      }
      console.log("turnedVisible", turnedVisible);
      return turnedVisible;
    }
    let clickedIndex;
    const neighboringCellIndexesThatAreZeroes = [];
    if(clickedIndexes instanceof Set){
      const tempArr = [...clickedIndexes];
      clickedIndex = tempArr.shift();
      tempArr.forEach(index => neighboringCellIndexesThatAreZeroes.push(index));
      
    }else if(typeof clickedIndexes === "number") {
      clickedIndex = clickedIndexes;
    }else {
      console.error("no type match");
      return;
    }

    addToListIfAllIsCorrect(clickedIndex);
    const rows = Math.sqrt(boardSize); // Calculate number of rows
    const columns = rows; // Since it's a square grid, columns = rows
    const clickedOnAZero = fasterUpdatingBoard.current[clickedIndex].numberOfNeighbouringMines === 0;

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
      const neighbourIndexIsAZero =
      fasterUpdatingBoard.current[neighbourIndex].numberOfNeighbouringMines === 0;
      if (addToListIfAllIsCorrect(neighbourIndex) && neighbourIndexIsAZero ) {
        // debugger
        console.log("zero");
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
    if(neighboringCellIndexesThatAreZeroes.length === 0) {
      //no need to do anything else
      return;
    }
    //if there are indexes in that array then recursion needs to happen
    calculateIndexesToTurnVisible(new Set(neighboringCellIndexesThatAreZeroes));
    return;
  };

  const handleClick = ({ target }) => {
    const temporaryBoard = [...board];
    if (!fasterUpdatingBoard.current[target.value].flagged && !gameOver && !youWon && !fasterUpdatingBoard.current[target.value].visible) {
      if ( fasterUpdatingBoard.current[target.value].hasMine) {
        temporaryBoard[target.value] = { ...temporaryBoard[target.value], visible: true };
        setBoard(temporaryBoard);
        setGameOver(true);
      }else {
        fasterUpdatingBoard.current = [...temporaryBoard];
        calculateIndexesToTurnVisible(
          parseInt(target.value)
        );
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
      board.filter((cellInfo) => cellInfo.visible)
        .length === boardSize - numberOfMines &&
      !document.querySelector("h4")
    ) {
      const cellsThatHasAMine = board.filter((cellInfo) => cellInfo.hasMine)
      const boardDiv = document.querySelector(".board");
      const youWonHeadline = document.createElement("h4");
      youWonHeadline.innerHTML = "You did it!";
      boardDiv.before(youWonHeadline);
      setYouWon(true);
      const tempBoard = [...board];
      console.log(cellsThatHasAMine)
      cellsThatHasAMine.forEach(cellInfo => {
        tempBoard[cellInfo.index] = { ...tempBoard[cellInfo.index], flagged: true}
      })
      console.log(tempBoard);
      setBoard(tempBoard);
    }
  }, [board]);

  const handleRightClick = (event) => {
    event.preventDefault();
    const cellIndex = event.target.value;
    if (cellIndex && !gameOver && !youWon) {
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
