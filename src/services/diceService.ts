/**
 * Dice rolling service using crypto.getRandomValues for secure and fair RNG.
 */
export const diceService = {
  /**
   * Rolls two 6-sided dice.
   * @returns An array of two numbers between 1 and 6.
   */
  rollDice: (): [number, number] => {
    const values = new Uint32Array(2);
    crypto.getRandomValues(values);

    // Using modulo 6 and adding 1 to get values from 1 to 6
    // Using bitwise AND for potentially better performance with small ranges
    // but modulo is fine for this use case.
    const dice1 = (values[0] % 6) + 1;
    const dice2 = (values[1] % 6) + 1;

    return [dice1, dice2];
  }
};
