// Variables extraidas de HTML
var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var rows = document.getElementById('rows');
var columns = document.getElementById('columns');
var mensaje = document.getElementById('mensaje');
var alertMsg = document.getElementById('alert');
var start = document.getElementById('configuracion');
var reset = document.getElementById('resetGame');
var player1 = document.getElementById('player1');
var player2 = document.getElementById('player2');

// Variables globales
var rowsNumber;
var columnsNumber;
var board = [];
var turno = 1;
var gameActive = false;
var alto;
var ancho;
var player1Name;
var player2Name;

// Inicializa el arreglo del juego con ceros
function inicia(){
    board = new Array(rowsNumber);
    for(let i = 0; i<rowsNumber; i++){
        board[i] = new Array(columnsNumber);
        for(let j = 0; j<columnsNumber; j++){
            board[i][j]= 0;
        }
    }
}

// Limpia el canvas y reinicia el juego
function limpia() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;              
    gameActive = false;
    turno = 1;
    canvas.style.display = "none";
    mensaje.textContent = "";
    reset.style.display = "none";
    start.style.display = "block";
    alertMsg.textContent = "";
}

// Dibuja el tablero y prepara el juego
function dibujaTablero() {
    gameActive = true;
    rowsNumber = parseInt(rows.value);
    columnsNumber = parseInt(columns.value);
    if(rowsNumber<6 || rowsNumber>12 || columnsNumber<7 || columnsNumber>12){
        mensaje.textContent = "Ingrese un número válido para jugar";
        mensaje.style.color = "#ff2a6d";
    }else{
        alto = canvas.height/rowsNumber;
        ancho = canvas.width/columnsNumber;
        player1Name = player1.value.trim() || "Jugador 1";
        player2Name = player2.value.trim() || "Jugador 2";
        inicia()
        reset.style.display = "block";
        start.style.display = "none";
        ctx.beginPath();
            for(let i = 1; i<columnsNumber; i++){
                ctx.moveTo(i*ancho,0);
                ctx.lineTo(i*ancho, canvas.height);
            }
            for(let j = 1; j<rowsNumber; j++){
                ctx.moveTo(0,j*alto);
                ctx.lineTo(canvas.width, j*alto);
            }
            ctx.strokeStyle = "#00f0ff";
            ctx.lineWidth = 3;
        ctx.stroke();
        mensaje.textContent = "Turno del jugador: " + player1Name;
        mensaje.style.color = "#c77dff";
        mensaje.style.textShadow = "0 0 5px #c77dff";
        canvas.style.display = "block";
        }
}

// Obtiene la posición del mouse sobre el eje x del canvas
function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var x = Math.floor((evt.clientX - rect.left)*scaleX);
    return x
}

// Encuentra la fila disponible para colocar la ficha en la columna seleccionada
function findRow(columnPos){
    let rowPos = 0;
    if(board[0][columnPos] !== 0){
        return -1;
    }else{
        for(let i = 0; i<rowsNumber; i++){
        if(board[i][columnPos] !== 0){
            rowPos = i-1;
            break;
        }else if(i === rowsNumber-1){
            rowPos = i;
        }
    }
    return rowPos;
    }
}

// Maneja el evento de click en el canvas para colocar fichas
function position(event) {
    var pos = getMousePos(event);
    var columnPos = Math.floor(pos / ancho);
    var rowPos = findRow(columnPos);

    if(gameActive){
        if(rowPos !== -1){
            alertMsg.textContent = "";
            if(turno%2 === 0){
                board[rowPos][columnPos] = 2;
                mensaje.textContent = "Turno del jugador: " + player1Name;
                mensaje.style.color = "#c77dff";
                mensaje.style.textShadow = "0 0 5px #c77dff";
                dibujaFicha(columnPos, rowPos, "#ff2a6d");
                checkBoard();
            } else {
                board[rowPos][columnPos] = 1;
                mensaje.textContent = "Turno del jugador: " + player2Name;
                mensaje.style.color = "#ff2a6d";
                mensaje.style.textShadow = "0 0 5px #ff2a6d";
                dibujaFicha(columnPos, rowPos, "#c77dff");
                checkBoard();
            }
            turno++;
        }else{
            alertMsg.textContent = "Esa columna ya está llena, elige otra.";
            alertMsg.style.color = "#ff2a6d";
            alertMsg.style.textShadow = "0 0 5px #ff2a6d";
        }
    }else{
        alertMsg.textContent = "¡El juego ha terminado! Presiona 'Nuevo Juego' para jugar de nuevo.";
        alertMsg.style.color = "#ff2a6d";
        alertMsg.style.textShadow = "0 0 5px #ff2a6d";
    }
}

// Dibuja la ficha en el tablero dependiendo del jugador que la coloque
function dibujaFicha(column, row, color) {

    ctx.clearRect(column * ancho + 2, row * alto + 2, ancho - 4, alto - 4);

    ctx.beginPath();
        ctx.arc(column*ancho + ancho/2, row*alto + alto/2, Math.min(ancho, alto)/2 - 5, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
    ctx.stroke();
}

// Revisa todo el tablero para verificar si hay una combinación ganadora después de cada movimiento
function checkBoard() {
    var flag = false;

    for(let i = 0; i<rowsNumber; i++){
        for(let j = 0; j<columnsNumber; j++){
            if(board[i][j] !== 0){
                if(checkWin(j, i, board[i][j])){
                    return;
                }
            }
        }
    }

    for(let i = 0; i<columnsNumber; i++){
        if(board[0][i] === 0){
            flag = true;
            break;
        }else{
            flag = false;
        }
    }

    if(!flag && gameActive){
        alertMsg.textContent = "¡Empate! No hay más movimientos posibles.";
        alertMsg.style.color = "#ff2a6d";
        alertMsg.style.textShadow = "0 0 5px #ff2a6d";
        gameActive = false;
        mensaje.textContent = "";
    }
}

// Verifica si hay una combinación ganadora después de colocar una ficha, revisando en las 4 direcciones posibles (horizontal, vertical y las dos diagonales)
function checkWin(posColumn, posRow, player) {
    var flag = false;

    // Verificar hacia la derecha
    for(let i = 1; i<4; i++){
        if(posColumn + i < columnsNumber && board[posRow][posColumn + i] === player){
            flag = true;
        }else{
            flag = false;
            break;
        }
    }

    if(!flag){
        // Verificar hacia abajo
        for(let i = 1; i<4; i++){
            if(posRow + i < rowsNumber && board[posRow + i][posColumn] === player){
                flag = true;
            }else{
                flag = false;
                break;
            }
        }
        if(!flag){
            // Verificar diagonal hacia abajo a la derecha
            for(let i = 1; i<4; i++){
                if(posColumn + i < columnsNumber && posRow + i < rowsNumber && board[posRow + i][posColumn + i] === player){
                    flag = true;
                }else{
                    flag = false;
                    break;
                }
            }
            if(!flag){
                // Verificar diagonal hacia arriba a la derecha
                for(let i = 1; i<4; i++){
                    if(posColumn + i < columnsNumber && posRow - i >= 0 && board[posRow - i][posColumn + i] === player){
                        flag = true;
                    }else{
                        flag = false;
                        break;
                    }
                }
                if(flag){
                    drawWin(4, posColumn, posRow);
                }
            }else{
                drawWin(3, posColumn, posRow);
            }
        }else{
            drawWin(2, posColumn, posRow);
        }
    }else{
        drawWin(1, posColumn, posRow);
    }
    
    if(flag){
        gameActive = false;
        mensaje.textContent = "🏆 ¡Felicidades " + (player === 1 ? player1Name : player2Name) + ", has ganado!";
        mensaje.style.color = "#ffd60a";
        mensaje.style.textShadow = "0 0 5px #ffd60a";
    }
    return flag;
}

// Dibuja la línea que indica la combinación ganadora dependiendo de la dirección en la que se haya dado el triunfo
function drawWin(win, posColumn, posRow) {
    ctx.strokeStyle = "#ffd60a";
    ctx.shadowColor = "#ffd60a";
    ctx.shadowBlur = 10;
    ctx.lineCap = "round";
    ctx.lineWidth = 5;

    switch(win){
        case 1: // Ganó hacia la derecha
            ctx.beginPath();
                ctx.moveTo(posColumn*ancho + ancho/3, posRow*alto + alto/2);
                ctx.lineTo((posColumn + 3)*ancho + (2*ancho/3), posRow*alto + alto/2);
            ctx.stroke();
            break;
        case 2: // Ganó hacia abajo
            ctx.beginPath();
                ctx.moveTo(posColumn*ancho + ancho/2, posRow*alto + alto/3);
                ctx.lineTo(posColumn*ancho + ancho/2, (posRow + 3)*alto + (2*alto/3));
            ctx.stroke();
            break;
        case 3: // Ganó diagonal hacia abajo a la derecha
            ctx.beginPath();
                ctx.moveTo(posColumn*ancho + ancho/3, posRow*alto + alto/3);
                ctx.lineTo((posColumn + 3)*ancho + (2*ancho/3), (posRow + 3)*alto + (2*alto/3));
            ctx.stroke();
            break;
        case 4: // Ganó diagonal hacia arriba a la derecha
            ctx.beginPath();
                ctx.moveTo(posColumn*ancho + ancho/3, posRow*alto + (2*alto/3));
                ctx.lineTo((posColumn + 3)*ancho + (2*ancho/3), (posRow - 3)*alto + alto/3);
            ctx.stroke();
            break;
    }
}

function standar(){
    rows.value = 6;
    columns.value = 7;
}

function iluminaCelda(evt) {
    var pos = getMousePos(evt);
    var px = Math.floor(pos / ancho);

    if(!gameActive || board[0][px] !== 0) return;

    for(let i = 0; i < rowsNumber; i++){
        for(let j = 0; j < columnsNumber; j++){
            if(board[i][j] === 0){
                ctx.clearRect(j * ancho + 2, i * alto + 2, ancho - 4, alto - 4);
            }
        }
    }

    ctx.fillStyle = "#00f0ff66";
    ctx.fillRect(px * ancho, findRow(px) * alto, ancho, alto);
}

function limpiaCelda() {
    for(let i = 0; i < rowsNumber; i++){
        for(let j = 0; j < columnsNumber; j++){
            if(board[i][j] === 0){
                ctx.clearRect(j * ancho + 2, i * alto + 2, ancho - 4, alto - 4);
            }
        }
    }
}