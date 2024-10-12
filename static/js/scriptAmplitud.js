const cols = 5;
const rows = 5;
const sizeCell = 65;
const grid = [];
const timeExecute = 100;
let start, goal;

function createGrid() {
    const gridElement = document.getElementById('grid');
    gridElement.style.gridTemplateColumns = `repeat(${cols},${sizeCell}px)`;
    gridElement.style.gridTemplateRows = `repeat(${rows},${sizeCell}px)`;

    for (let i = 0; i < rows; i++) {
        grid[i] = [];
        for (let j = 0; j < cols; j++) {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            gridElement.appendChild(cellElement);

            const cell = {
                x: i,
                y: j,
                isWall: false,
                parent: null,
                element: cellElement
            };
            grid[i][j] = cell;
            cellElement.innerHTML = `<span>${i},${j}</span>`;

            if (i === 0 && j === 0) {
                start = cell;
                cellElement.classList.add('start');
            } else if (i === rows - 1 && j === cols - 1) {
                goal = cell;
                cellElement.classList.add('goal');
            }

            if (Math.random() < 0.2 && cell !== start && cell !== goal) {
                cell.isWall = true;
                cellElement.classList.add('wall');
            }
        }
    }
}

function getNeighbors(node) {
    const neighbors = [];
    const { x, y } = node;

    if (x > 0) neighbors.push(grid[x - 1][y]); // Arriba
    if (x < rows - 1) neighbors.push(grid[x + 1][y]); // Abajo
    if (y > 0) neighbors.push(grid[x][y - 1]); // Izquierda
    if (y < cols - 1) neighbors.push(grid[x][y + 1]); // Derecha

    return neighbors;
}

const ruta = document.querySelector('#Ruta');
const arbol = document.querySelector('#Frontera');

function addToFrontera(parent, neighbors, depth) {
    const fronteraContainer = document.getElementById('Frontera');

    const parentColumn = document.createElement('div');
    parentColumn.classList.add('table-column');

    const parentCostCell = document.createElement('div');
    parentCostCell.classList.add('table-cell');
    parentCostCell.innerText = parent ? depth : 0;  // Profundidad como costo

    const separatorCell = document.createElement('div');
    separatorCell.classList.add('table-cell');
    separatorCell.innerText = parent.parent ? `${parent.x},${parent.y}` : '-';

    const parentNameCell = document.createElement('div');
    parentNameCell.classList.add('table-cell');
    parentNameCell.innerText = parent ? `${parent.x},${parent.y}` : "-";

    parentColumn.appendChild(parentCostCell);
    parentColumn.appendChild(separatorCell);
    parentColumn.appendChild(parentNameCell);
    fronteraContainer.appendChild(parentColumn);

    neighbors.forEach(neighbor => {
        const neighborColumn = document.createElement('div');
        neighborColumn.classList.add('table-column');

        const costCell = document.createElement('div');
        costCell.classList.add('table-cell');
        costCell.innerHTML = `<p>${depth} + 1</p><p><b>${depth + 1}</b></p>`;

        const parentNodeCell = document.createElement('div');
        parentNodeCell.classList.add('table-cell');
        parentNodeCell.innerText = `${parent.x},${parent.y}`;

        const neighborCell = document.createElement('div');
        neighborCell.classList.add('table-cell');
        neighborCell.innerText = `${neighbor.x},${neighbor.y}`;

        neighborColumn.appendChild(costCell);
        neighborColumn.appendChild(parentNodeCell);
        neighborColumn.appendChild(neighborCell);

        fronteraContainer.appendChild(neighborColumn);
    });
}

function updateNodoActual(current) {
    const nodoElement = document.getElementById('Nodo');
    nodoElement.innerHTML = `<p>${current.x},${current.y}</p>`;
}

function updateExplorados(closedSet) {
    const exploradosElement = document.getElementById('Explorados');
    exploradosElement.innerHTML = '';

    closedSet.forEach(node => {
        const nodeElement = document.createElement('p');
        nodeElement.innerText = `${node.x},${node.y}`;
        exploradosElement.appendChild(nodeElement);
    });
}

function reconstructPath(current) {
    let delay = 0;
    ruta.innerHTML = '';
    while (current) {
        const node = current;
        setTimeout(() => {
            if (node && node.element) {
                node.element.classList.add('path');
                ruta.innerHTML += `<p>${node.x},${node.y}</p>`;
            }
        }, delay * 20);
        current = current.parent;
        delay++;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function breadthFirstSearch(start, goal) {
    const openSet = [start];
    const closedSet = [];
    let depth = 0;

    while (openSet.length > 0) {
        const current = openSet.shift();
        closedSet.push(current);

        updateNodoActual(current);
        updateExplorados(closedSet);

        if (current === goal) {
            reconstructPath(current);
            return true;
        }

        const neighbors = getNeighbors(current).filter(neighbor => !neighbor.isWall && !closedSet.includes(neighbor));

        neighbors.forEach(neighbor => {
            if (!openSet.includes(neighbor)) {
                neighbor.parent = current;
                openSet.push(neighbor);
            }
        });

        addToFrontera(current, neighbors, depth);
        await delay(timeExecute);

        depth++;
    }

    console.log("No se encontró una ruta.");
    return false;
}

createGrid();

const btnEmpezar = document.querySelector('#iniciar');
btnEmpezar.addEventListener('click', () => {
    breadthFirstSearch(start, goal);
    btnEmpezar.disabled = true;
});

document.querySelector('#reiniciar').addEventListener('click', () => {
    location.reload();
});