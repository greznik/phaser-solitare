import Phaser from 'phaser'

import cardsAtlasJson from '../assets/cards/cards.json'
import cardsAtlasPng from '../assets/cards/cards.png'
import restartImage from '../assets/cards/restart.png'
import pauseImage from '../assets/cards/pause.png'
import placeOgg from '../assets/cards/cardPlace.ogg'
import placeMp3 from '../assets/cards/cardPlace.mp3'

import { Table } from './model'
import { CardView, StackView } from './views'

export class MainScene extends Phaser.Scene {
  _model: Table
  _cardViews: Array<CardView>
  _stackViews: Array<StackView>

  constructor() {
    super({ key: 'MainScene' })
    this._model = new Table()
    this._cardViews = []
    this._stackViews = []
  }

  preload() {
    this.load.atlas('cards', cardsAtlasPng, cardsAtlasJson)
    this.load.image('restart', restartImage)
    this.load.image('pause', pauseImage)
    this.load.audio('place', [placeOgg, placeMp3]) // problem on ios, use cordova plugin for audio
  }

  create() {
    this.cameras.main.fadeIn(1000)
    this._stackViews = []
      .concat([
        new StackView(
          this._model.closedUnusedStack,
          this,
          'cards',
          'back',
          0,
          10 + 70,
          110,
        ),
        new StackView(
          this._model.openUnusedStack,
          this,
          'cards',
          'back',
          0,
          10 + 70 + 150,
          110,
        ),
      ])
      .concat(
        this._model.resultStacks.map(
          (v, k) =>
            new StackView(
              v,
              this,
              'cards',
              'back',
              0,
              10 + 70 + 150 * (k + 3),
              110,
            ),
        ),
      )
      .concat(
        this._model.workStacks.map(
          (v, k) =>
            new StackView(v, this, 'cards', 'back', 50, 10 + 70 + 150 * k, 310),
        ),
      )
    const closedStackView = this._stackViews[0]
    closedStackView.on('pointerdown', (pointer) => {
      this._model.switchToNextUnusedCard()
    })

    this._cardViews.push(
      ...this._model.cards.map(
        (c) =>
          new CardView(
            c,
            this,
            this._stackViews,
            this._cardViews,
            'cards',
            ['spades', 'diamonds', 'clubs', 'hearts'][c.suit] +
              [
                'Ace',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8',
                '9',
                '10',
                'Jack',
                'Queen',
                'King',
              ][c.rank],
            'back',
            10 + c.rank * 50,
            510 + c.suit * 200,
          ),
      ),
    )

    this._model.on('move', () => this.sound.play('place'))

    this._model.restart()

    this.restartBtn = this.add.image(0, this.cameras.main.height, 'restart')
    this.restartBtn.scale = 2
    this.restartBtn.setOrigin(0, 1)
    this.restartBtn.setInteractive()
    this.restartBtn.on('pointerdown', (pointer) => {
      this._model.restart()
    })

    this.pauseBtn = this.add.image(
      this.cameras.main.width - 200,
      this.cameras.main.height,
      'pause',
    )
    this.pauseBtn.scale = 0.2
    this.pauseBtn.setOrigin(0, 1)
    this.pauseBtn.setInteractive()
    this.pauseBtn.on(
      'pointerdown',
      (pointer) => {
        this._model.openTable()
      },
      this,
    )
  }

  update() {
    for (var i = 0; i < this._cardViews.length; i++) {
      this._cardViews[i].update()
    }
  }
}
