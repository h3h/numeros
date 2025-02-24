export class NumeroDOM {
  #currentNoun
  #currentNumber
  #currentGender
  #currentEmoji
  #numberInput
  #numero
  #numeroSet
  #output
  #textInput
  #numeroService

  constructor(numeroService) {
    this.#numeroService = numeroService
    this.attachDOM()
  }

  attachDOM() {
    document.addEventListener('DOMContentLoaded', () => {
      this.#numberInput = document.getElementById('numberInput')
      this.#numero = document.getElementById('numero')
      this.#numeroSet = document.getElementById('numeroSet')
      this.#output = document.getElementById('output')
      this.#textInput = document.getElementById('textInput')

      this.#textInput.addEventListener('keydown', (e) => this.handleInput(e))
      this.#numeroSet.addEventListener('dblclick', () => this.handleManualEntry())
      this.#numberInput.addEventListener('keydown', (e) => this.handleNumberInput(e))
      this.#numberInput.addEventListener('blur', (e) => this.handleNumberInput(e))

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

  handleManualEntry() {
    this.#numeroSet.classList.add('manual-entry')
    this.#numero.innerText = `${this.#currentNoun} ${this.#currentEmoji}`
  }

  handleNumberInput(event) {
    if (event.type === 'blur' || (event.type === 'keydown' && event.key === 'Enter')) {
      const newValue = event.target.value.replace(/[^\d]+/g, '').trim()
      this.updateNumber(newValue)
      this.#numeroSet.classList.remove('manual-entry')
    } else if (event.key === 'Escape') {
      this.updateNumber(this.#currentNumber)
      this.#numeroSet.classList.remove('manual-entry')
    }
  }

  updateNumber(number) {
    this.#currentNumber = number
    this.#numberInput.value = number
    this.#clearInputAndOutput()
    const formattedNumber = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    this.#numero.innerText = `${formattedNumber} ${this.#currentNoun} ${this.#currentEmoji}`
  }

  updatePrompt() {
    const [number, noun, gender, emoji] = this.#numeroService.generateOutputSet()

    this.#currentNoun = noun
    this.#currentGender = gender
    this.#currentEmoji = emoji

    this.updateNumber(number)
  }

  #clearInputAndOutput() {
    this.#textInput.disabled = false
    this.#textInput.value = ''
    this.#output.innerHTML = ''
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
        this.#clearInputAndOutput()
        this.updatePrompt()
      }
    }, 100)
  }

  #showError() {
    const correctWords = this.#numeroService.numberToWords(this.#currentNumber, this.#currentGender)
    this.#output.innerHTML = `¡Por poco!<br>${correctWords} ${this.#currentNoun}`
  }
}
