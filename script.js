const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

const COLUNAS = 10;
const LINHAS = 20;
const TAMANHO_BLOCO = 20;

context.scale(1, 1);

const CORES = [ null, '#0074D9', '#2ECC40', '#FF4136', '#FFDC00', '#B10DC9' ];

const PECAS = [
    [],
    [[1, 0], [1, 0], [1, 1]],
    [[0, 2, 0], [2, 2, 2]],
    [[3, 3, 3, 3]],
    [[4, 4], [4, 4]],
    [[0, 5], [0, 5], [5, 5]]
];

function criarMatriz(largura, altura) {
    const matriz = [];
    while (altura--) {
        matriz.push(new Array(largura).fill(0));
    }
    return matriz;
}

function temColisao(campo, peca) {
    const [matriz, posicao] = [peca.matriz, peca.pos];
    for (let y = 0; y < matriz.length; ++y) {
        for (let x = 0; x < matriz[y].length; ++x) {
            if (
                matriz[y][x] &&
                (campo[y + posicao.y] && campo[y + posicao.y][x + posicao.x]) !== 0
            ) {
                return true;
            }
        }
    }
    return false;
}

function mesclar(campo, peca) {
    peca.matriz.forEach((linha, y) => {
        linha.forEach((valor, x) => {
            if (valor) {
                campo[y + peca.pos.y][x + peca.pos.x] = valor;
            }
        });
    });
}

function rotacionar(matriz) {
    return matriz[0].map((_, i) => matriz.map(linha => linha[i])).reverse();
}

function novaPeca() {
    const tipo = Math.floor(Math.random() * 5) + 1;
    return {
        matriz: PECAS[tipo].map(linha => linha.slice()),
        pos: { x: Math.floor(COLUNAS / 2) - 1, y: 0 },
        tipo
    };
}

function desenharMatriz(matriz, posicao) {
    matriz.forEach((linha, y) => {
        linha.forEach((valor, x) => {
            if (valor) {
                context.fillStyle = CORES[valor];
                context.fillRect((x + posicao.x) * TAMANHO_BLOCO, (y + posicao.y) * TAMANHO_BLOCO, TAMANHO_BLOCO, TAMANHO_BLOCO);
                context.strokeStyle = "#222";
                context.strokeRect((x + posicao.x) * TAMANHO_BLOCO, (y + posicao.y) * TAMANHO_BLOCO, TAMANHO_BLOCO, TAMANHO_BLOCO);
            }
        });
    });
}

function desenhar() {
    context.fillStyle = '#111';
    context.fillRect(0, 0, COLUNAS * TAMANHO_BLOCO, LINHAS * TAMANHO_BLOCO);
    desenharMatriz(campo, { x: 0, y: 0 });
    desenharMatriz(jogador.matriz, jogador.pos);
}

function limparLinhas() {
    let pontos = 0;
    let bonus = 1;

    for (let y = campo.length - 1; y >= 0; --y) {
        if (campo[y].every(c => c !== 0)) {
            campo.splice(y, 1);
            campo.unshift(new Array(COLUNAS).fill(0));
            pontos += bonus * 10;
            bonus *= 2;
            y++;
        }
    }

    return pontos;
}

function atualizarPlacar() {
    scoreDisplay.textContent = jogador.pontos;
}

function cairPeca() {
    jogador.pos.y++;
    if (temColisao(campo, jogador)) {
        jogador.pos.y--;
        mesclar(campo, jogador);
        jogador.pontos += limparLinhas();
        atualizarPlacar();
        reiniciarPeca();

        if (temColisao(campo, jogador)) {
            alert('Fim de jogo! Pontuação: ' + jogador.pontos);
            document.location.reload();
        }
    }
    tempoQueda = 0;
}

function moverPeca(direcao) {
    jogador.pos.x += direcao;
    if (temColisao(campo, jogador)) {
        jogador.pos.x -= direcao;
    }
}

function girarPeca() {
    const matrizOriginal = jogador.matriz.map(linha => linha.slice());
    jogador.matriz = rotacionar(jogador.matriz);
    if (temColisao(campo, jogador)) {
        jogador.matriz = matrizOriginal;
    }
}

function reiniciarPeca() {
    Object.assign(jogador, novaPeca());
}

let campo = criarMatriz(COLUNAS, LINHAS);
let jogador = {
    pos: { x: 0, y: 0 },
    matriz: null,
    pontos: 0
};
reiniciarPeca();

let tempoQueda = 0;
let intervaloQueda = 1000;
let ultimoTempo = 0;

function atualizar(tempo = 0) {
    const delta = tempo - ultimoTempo;
    ultimoTempo = tempo;

    tempoQueda += delta;
    if (tempoQueda > intervaloQueda) {
        cairPeca();
    }

    desenhar();
    requestAnimationFrame(atualizar);
}

document.addEventListener('keydown', evento => {
    if (evento.key === 'ArrowLeft') moverPeca(-1);
    else if (evento.key === 'ArrowRight') moverPeca(1);
    else if (evento.key === 'ArrowDown') cairPeca();
    else if (evento.key === 'ArrowUp') girarPeca();
});

setInterval(() => {
    intervaloQueda = Math.max(100, intervaloQueda * 0.9);
}, 30000);

atualizarPlacar();
atualizar();
