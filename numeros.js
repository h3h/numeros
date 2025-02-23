class Numeros {
  #numero
  #output
  #textInput

  constructor() {
    document.addEventListener('DOMContentLoaded', () => {
      this.#numero = document.getElementById('numero')
      this.#output = document.getElementById('output')
      this.#textInput = document.getElementById('textInput')

      this.#textInput.addEventListener('keydown', (e) => this.validateInput(e))

      this.generateNumero()
    })
  }

  generateNumero() {
    const floor = 100 // only generate numbers above 100
    let scale

    const scales = [
      [25, 999], // 25% of the time generate a number less than 1000
      [40, 9999], // 15% of the time generate a number less than 10 000
      [55, 99999], // etc.
      [80, 999999],
      [100, 9999999],
    ]
    const random = Math.round(Math.random() * 100)
    scale = scales.find((vals) => {
      return random <= vals[0]
    })[1]

    const number = floor + Math.round(Math.random() * scale)
    const formattedNumber = number
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') // spaces as thousands separators

    this.#numero.innerText = formattedNumber
  }

  validateInput(event) {
    if (event.key === 'Enter') {
      this.#output.innerText = 'Exito'
    }
    console.log(this.#textInput.value)
  }
}

const numeros = new Numeros()
