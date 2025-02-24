export class NumeroDOM {
  #currentNoun
  #currentNumber
  #currentGender
  #numero
  #output
  #textInput
  #numeroService

  constructor(numeroService) {
    this.#numeroService = numeroService
    this.attachDOM()
  }

  attachDOM() {
    document.addEventListener('DOMContentLoaded', () => {
      this.#numero = document.getElementById('numero')
      this.#output = document.getElementById('output')
      this.#textInput = document.getElementById('textInput')

      this.#textInput.addEventListener('keydown', (e) => this.handleInput(e))

      this.updatePrompt()
    })
  }

  handleInput(event) {
    if (event.key === 'Enter') {
      const input = this.#textInput.value.trim()
      const nounAtEnd = new RegExp(` ${this.#currentNoun}$`)
      const inputWithoutNoun = input.replace(nounAtEnd, '')

      if (
        nounAtEnd.test(input) &&
        this.#numeroService.validateWords(inputWithoutNoun, this.#currentNumber, this.#currentGender)
      ) {
        this.#showSuccess()
      } else {
        this.#showError()
      }
    }
  }

  updatePrompt() {
    const [number, noun, gender, emoji] = this.#numeroService.generateOutputSet()

    this.#currentNumber = number
    this.#currentNoun = noun
    this.#currentGender = gender

    const formattedNumber = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    this.#numero.innerText = `${formattedNumber} ${noun} ${emoji}`
  }

  #showSuccess() {
    this.#textInput.disabled = true // Prevent further input during animation

    // Start celebration animation
    let count = 0
    const emojis = ['🎉', '✨', '🎊', '🌟', '💫']
    const animation = setInterval(() => {
      const randomEmojis = Array(3)
        .fill()
        .map(() => emojis[Math.floor(Math.random() * emojis.length)])
        .join(' ')
      this.#output.innerText = `${randomEmojis} ¡Éxito! ${randomEmojis}`
      count++

      // End animation after 2 seconds (assuming 100ms intervals)
      if (count > 20) {
        clearInterval(animation)
        this.#textInput.disabled = false
        this.#textInput.value = ''
        this.#output.innerHTML = ''
        this.updatePrompt()
      }
    }, 100)
  }

  #showError() {
    const correctWords = this.#numeroService.numberToWords(this.#currentNumber, this.#currentGender)
    this.#output.innerHTML = `¡Por poco!<br>${correctWords} ${this.#currentNoun}`
  }
}
