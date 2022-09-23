
const _ = require('lodash');
const Mocha = require('mocha');
const chai = require('chai');
const expect = chai.expect;
var mocha = new Mocha();

// Bit of a hack, sorry! - from Codepad.io
mocha.suite.emit('pre-require', this, 'solution', mocha)

class OutofRangeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'OutofRangeError';
  }
}

class NotDivideAbleError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotDivideAbleError';
  }
}

class IndexNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'IndexNotFoundError';
  }
}

function numberToString(val) {
  const mapping = {
    1: 'first',
    2: 'second',
    3: 'third',
    4: 'fourth',
    5: 'fifth',
    6: 'sixth',
    7: 'seventh',
    8: 'eighth',
    9: 'nineth',
    10: 'tenth',
  };

  const tenthMapping = {
    11: 'eleven',
    12: 'twelve',
    13: 'thirteen',
    14: 'fourteen',
    15: 'fiveteen',
    16: 'sixteen',
    17: 'seventeen',
    18: 'eighteen',
    19: 'nineteen',
    20: 'twenty',
  };

  const firstDigit = {
    2: 'tweenty',
    3: 'thirty',
    4: 'fourty',
    5: 'fivety',
    6: 'sixty',
    7: 'seventy',
    8: 'eighty',
    9: 'ninety',
  }

  if (val <= 10) {
    return mapping[val];
  } else if (val > 10 && val <= 20) {
    return tenthMapping[val];
  } else if (val < 100) {
    const [first, second] = val.toString().split('');
    let str = firstDigit[Number.parseInt(first)];
    str += mapping[Number.parseInt(second)];
    return str;
  }

  throw new OutofRangeError(`${val} is out of the supported range`);
}

const ordialStrCache = Array.from({length: 99}).reduce((arr, val, index) => {
  arr[numberToString(index+1)] = index + 1;
  return arr;
}, {});


function numStrToValue(numStr) {
  return ordialStrCache[numStr];
}

function regMatch(str) {
  const matches = [...str.matchAll(/([a-z]+) ([a-z]+) of/ig)];
  const result = matches.map((x) => {
    return [numStrToValue(x[1]), numStrToValue(x[2])]; 
  });

  return result
}

function stringParse(str, data) {
  const division = regMatch(str).reverse();
  const result = data.map((x) => {
    const queue = [...division];
    let arrayData = [...x];
    while(queue.length) {
      const div = queue.shift();
      const [pos, divisionNum] = div;

      if (arrayData.length % divisionNum !== 0) {
        throw new NotDivideAbleError('not dividable');
      }
      const size = arrayData.length / divisionNum;
      const chunks = [];
      for (let i = 0; i < arrayData.length; i += size) {
        const chunk = arrayData.slice(i, i + size);
        chunks.push(chunk);
      }

      if (chunks[pos - 1]) {
        arrayData = chunks[pos - 1];
      } else {
        throw new IndexNotFoundError('Index is out of bound');
      }
    }
    return arrayData;
  }); 

  return result.map((x) => x && x.join(''));
}

describe('reg match', () => {
  it ('should work', () => {
    expect(regMatch("second fourth of it")).to.deep.equal([[2, 4]]);
  });

  it ('should work', () => {
    expect(regMatch("second third of first third of it")).to.deep.equal([[2, 3], [1, 3]]);
  });
  
  it ('should work', () => {
    expect(regMatch("blah it")).to.deep.equal([]);
  });
});

describe('stringParse', () => {
  it ('should work', () => {
    expect(stringParse("second fourth of it", ["abcd", "abcdefgh"])).to.deep.equal(["b", "cd"]);

    expect(stringParse("second third of first third of it", ["123456789"])).to.deep.equal(["2"]);

    try {
      stringParse("third fourth of it", ["abcdef"]);
    } catch (ex) {
      expect(ex.message).to.equal('not dividable');
    }

    try {
      stringParse("fifth fourth of it", ["abcd"]);
    } catch (ex) {
      expect(ex.message).to.equal('Index is out of bound');
    }
  });
});


mocha.run()