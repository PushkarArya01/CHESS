const socket = io();
const chess = new Chess();

const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

function renderBoard() {

    const board = chess.board();
    boardElement.innerHTML = "";

    board.forEach((row, rowIndex) => {

        row.forEach((square, colIndex) => {

            const squareElement = document.createElement("div");

            squareElement.classList.add(
                "square",
                (rowIndex + colIndex) % 2 === 0 ? "light" : "dark"
            );

            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = colIndex;

            // Flip board for black player
            if (playerRole === "b") {
                squareElement.style.order = `${(7 - rowIndex) * 8 + (7 - colIndex)}`;
            }

            if (square) {

                const pieceElement = document.createElement("div");

                pieceElement.classList.add(
                    "piece",
                    square.color === "w" ? "white" : "black"
                );

                pieceElement.innerHTML = getPieceUnicode(square);

                pieceElement.draggable =
                    playerRole === square.color &&
                    chess.turn() === playerRole;

                pieceElement.addEventListener("dragstart", (e) => {

                    if (!pieceElement.draggable) return;

                    draggedPiece = pieceElement;

                    sourceSquare = {
                        row: rowIndex,
                        col: colIndex
                    };

                    e.dataTransfer.setData("text/plain", "");

                });

                pieceElement.addEventListener("dragend", () => {

                    draggedPiece = null;
                    sourceSquare = null;

                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            squareElement.addEventListener("drop", (e) => {

                e.preventDefault();

                if (!draggedPiece) return;

                const targetSquare = {

                    row: Number(squareElement.dataset.row),
                    col: Number(squareElement.dataset.col)

                };

                handleMove(sourceSquare, targetSquare);

            });

            boardElement.appendChild(squareElement);

        });

    });

}


function handleMove(source, target) {

    const move = {

        from:
            String.fromCharCode(97 + source.col) +
            (8 - source.row),

        to:
            String.fromCharCode(97 + target.col) +
            (8 - target.row),

        promotion: "q"

    };

    socket.emit("move", move);

}

// --------------------
// Chess Unicode
// --------------------
function getPieceUnicode(piece) {

    const pieces = {

        wp: "♙",
        wr: "♖",
        wn: "♘",
        wb: "♗",
        wq: "♕",
        wk: "♔",

        bp: "♟",
        br: "♜",
        bn: "♞",
        bb: "♝",
        bq: "♛",
        bk: "♚"

    };

    return pieces[piece.color + piece.type];

}


socket.on("playerRole", (role) => {

    playerRole = role;

    renderBoard();

});

socket.on("spectatorRole", () => {

    playerRole = null;

    renderBoard();

});

socket.on("boardState", (fen) => {

    chess.load(fen);

    renderBoard();

});

socket.on("move", () => {

    renderBoard();

});

socket.on("invalidMove", () => {

    alert("Invalid Move");

});



renderBoard();