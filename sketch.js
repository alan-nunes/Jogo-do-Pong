let bola;
let raqueteJogador;
let raqueteComputador;
let larguraRaquete = 10;
let alturaRaquete = 100;
let alturaBorda = 5;
let corBorda = '#2B3FD6';
let img;
let imgBolaFutebol;
let placarJogador = 0;
let placarComputador = 0;

function preload() {
  img = loadImage('https://picsum.photos/800/400/?random');
  imgBolaFutebol = loadImage('https://upload.wikimedia.org/wikipedia/commons/e/ec/Soccer_ball.svg'); // URL alternativa para a bola de futebol
}

function setup() {
  createCanvas(800, 400);
  bola = new Bola();
  raqueteJogador = new Raquete(true);
  raqueteComputador = new Raquete(false);
}

function draw() {
  background(img);
  desenharBordas();

  bola.atualizar();
  bola.mostrar();
  bola.verificarColisaoRaquete(raqueteJogador);
  bola.verificarColisaoRaquete(raqueteComputador);

  raqueteJogador.atualizar();
  raqueteJogador.mostrar();

  raqueteComputador.moverAI(bola);
  raqueteComputador.atualizar();
  raqueteComputador.mostrar();
}

function desenharBordas() {
  fill(corBorda);
  rect(0, 0, width, alturaBorda); // Borda superior
  rect(0, height - alturaBorda, width, alturaBorda); // Borda inferior
}

class Bola {
  constructor() {
    this.reiniciar();
  }

  reiniciar() {
    this.x = width / 2;
    this.y = height / 2;
    this.velocidadeX = random(3, 5) * (random(1) > 0.5 ? 1 : -1);
    this.velocidadeY = random(3, 5) * (random(1) > 0.5 ? 1 : -1);
    this.raio = 12;
    this.spin = 0;
  }

  atualizar() {
    this.x += this.velocidadeX;
    this.y += this.velocidadeY + this.spin;

    if (this.y - this.raio < alturaBorda || this.y + this.raio > height - alturaBorda) {
      this.velocidadeY *= -1;
      this.spin *= -1;
    }

    if (this.x < 0) {
      placarComputador++;
      narrarPlacar();
      this.reiniciar();
    } else if (this.x > width) {
      placarJogador++;
      narrarPlacar();
      this.reiniciar();
    }
  }

  mostrar() {
    fill(255);
    // Desenhar a bola de futebol
    image(imgBolaFutebol, this.x - this.raio, this.y - this.raio, this.raio * 2, this.raio * 2);
  }

  verificarColisaoRaquete(raquete) {
    if (
      this.y > raquete.y &&
      this.y < raquete.y + raquete.altura &&
      (this.x - this.raio < raquete.x + raquete.largura && this.x + this.raio > raquete.x)
    ) {
      // Calcular a posição de impacto na raquete
      let impacto = (this.y - raquete.y) / raquete.altura;
      let angulo = map(impacto, 0, 1, -PI / 4, PI / 4); // Ângulo de desvio

      // Calcular a nova velocidade com base no ângulo
      let velocidade = sqrt(this.velocidadeX * this.velocidadeX + this.velocidadeY * this.velocidadeY);
      this.velocidadeX = velocidade * cos(angulo) * (this.velocidadeX > 0 ? -1 : 1);
      this.velocidadeY = velocidade * sin(angulo);

      // Adicionar efeito de giro baseado no impacto
      this.spin = map(impacto, 0, 1, -1, 1);

      // Aumentar a velocidade da bola após a colisão
      this.velocidadeX *= 1.1;
      this.velocidadeY *= 1.1;

      // Adicionar variação à velocidade da bola
      this.velocidadeX += random(-1, 1);
      this.velocidadeY += random(-1, 1);

      // Mover a raquete do computador para uma posição aleatória
      if (!raquete.eJogador) {
        raquete.posicaoAlvoY = random(alturaBorda, height - alturaBorda - raquete.altura);
      }
    }
  }
}

class Raquete {
  constructor(eJogador) {
    this.eJogador = eJogador;
    this.largura = larguraRaquete;
    this.altura = alturaRaquete;
    this.x = this.eJogador ? 10 : width - this.largura - 10;
    this.y = height / 2 - this.altura / 2;
    this.posicaoAlvoY = this.y;
    this.velocidade = 5;
  }

  atualizar() {
    if (this.eJogador) {
      this.y = constrain(mouseY - this.altura / 2, alturaBorda, height - alturaBorda - this.altura);
    } else {
      this.y = constrain(this.y, alturaBorda, height - alturaBorda - this.altura);
    }
  }

  moverAI(bola) {
    if (!this.eJogador) {
      // Acompanhar a posição da bola com um pequeno atraso
      if (bola.y < this.y + this.altura / 2) {
        this.y -= this.velocidade;
      } else if (bola.y > this.y + this.altura / 2) {
        this.y += this.velocidade;
      }
    }
  }

  mostrar() {
    fill(255);
    rect(this.x, this.y, this.largura, this.altura);
  }
}

function narrarPlacar() {
  let mensagem = `Placar: Jogador ${placarJogador}, Computador ${placarComputador}`;
  let sintese = new SpeechSynthesisUtterance(mensagem);
  sintese.lang = 'pt-BR';
  window.speechSynthesis.speak(sintese);
}
