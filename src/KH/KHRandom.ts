/**
 * Random value abstract class for wrapping different PRNGs. None of these are
 * secure or completely random. Don't use them for anything that matters.
 */
export abstract class KHIRandom {
    maxValue: number;

    /**
     * Returns a random element from the array.
     * @param array 
     */
    getRandom<T>(array: T[]): T {
        return array[this.nextInt(0, array.length)];
    }

    getNRandom<T>(array: T[], count: number): T[] {
        if (count >= array.length) return array;
        return this.shuffledArray(array).slice(0, count);
    }

    /**
     * Copies an array and shuffles it.
     */
    shuffledArray<T>(array: T[]): T[] {
        const newArray = [].concat(array);
        this.shuffleArray(newArray);
        return newArray;
    }

    /**
     * Shuffles an array in place.
     * @param array Array to shuffle.
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = this.nextInt(0, i + 1);
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    getNRandomEnum<T>(anEnum: T, count: number): T[keyof T][] {
        const enumValues = this.arrayFromEnum(anEnum)
        return this.getNRandom(enumValues, count);
    }

    getRandomEnum<T>(anEnum: T): T[keyof T] {
        const enumValues = this.arrayFromEnum(anEnum)
        const randomIndex = Math.floor(this.next() * enumValues.length)
        const randomEnumValue = enumValues[randomIndex]
        return randomEnumValue;
    }

    arrayFromEnum<T>(anEnum: T): T[keyof T][] {
        return Object.keys(anEnum)
            .map(n => Number.parseInt(n))
            .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
    }

    /**
     * Returns the next random number between [0,1). Either this or 
     * nextIntNoRange must be implemented.
     */
    next(): number {
        return this.nextInt(0, this.maxValue) / this.maxValue;
    }

    nextFloat(min: number, max: number) {
        return this.next() * (max - min) + min;
    }

    /**
     * Returns a boolean that is true with a chance of chance.
     * @param chance Number between 0 and 1.
     */
    withChance(chance: number): boolean {
        return this.next() < chance;
    }

    /**
     * Returns the next boolean.
     */
    nextBoolean(): boolean {
        return this.next() >= 0.5;
    }

    /**
     * Returns the next random number between min and max.  Note: This will max out at maxValue, so be aware
     * if you're passing in a larger value.
     * @param min 
     * @param maxExclusive 
     */
    nextInt(min: number = 0, maxExclusive: number = this.maxValue): number {
        return (this.nextIntNoRange() % (maxExclusive - min)) + min;
    }

    /**
     * Either this or next must be implemented.
     */
    protected nextIntNoRange(): number {
        return Math.floor(this.next() * this.maxValue);
    }

    constructor(seed: number) {
        if (this.constructor === KHIRandom) {
            throw "Can't instantiate this directly.";
        }
    }
}

export class KHRandomGeneral extends KHIRandom {

    constructor(seed?: number) {
        if (seed !== undefined) {
            console.log("KHRandomGeneral does not take a seed.");
        }
        super(0);
        // Can't use max safe integer since that always returns odd numbers.
        // This is good enough.
        this.maxValue = 0xFFFFFFFF;
    }

    next(): number {
        return Math.random();
    }

    // nextInt(min: number = 0, maxExclusive: number = this.maxValue): number {
    //     return Math.floor(Math.random() * (maxExclusive - min) + min);
    // }
}

export class KHRandomSeedable extends KHIRandom {
    current: number;

    constructor(seed) {
        super(seed);
        this.maxValue = 0x7FFF;
        this.current = seed;
    }

    protected nextIntNoRange(): number {
        const m = 0x41C64E6D;
        const c = 0x3039;
        this.current = (Math.imul(this.current, m) + c) | 0;
        return (this.current >> 10) & this.maxValue;
    }
}