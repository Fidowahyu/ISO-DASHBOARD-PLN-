export interface FormulaToken {
  type: 'number' | 'identifier' | 'operator' | 'leftParen' | 'rightParen' | 'comma';
  value: string;
}

export interface FormulaEvaluation {
  result: number;
  variables: string[];
}

const FUNCTIONS: Record<string, (values: number[]) => number> = {
  SUM: values => values.reduce((total, value) => total + value, 0),
  AVERAGE: values => values.length ? values.reduce((total, value) => total + value, 0) / values.length : NaN,
  MIN: values => Math.min(...values),
  MAX: values => Math.max(...values),
  COUNT: values => values.length,
};

function tokenize(formula: string): FormulaToken[] {
  const tokens: FormulaToken[] = [];
  let index = 0;
  while (index < formula.length) {
    const char = formula[index];
    if (/\s/.test(char)) { index += 1; continue; }
    if (/\d|\./.test(char)) {
      const match = formula.slice(index).match(/^\d+(?:\.\d+)?/);
      if (!match) throw new Error('Invalid number in formula.');
      tokens.push({ type: 'number', value: match[0] }); index += match[0].length; continue;
    }
    if (/[A-Za-z_]/.test(char)) {
      const match = formula.slice(index).match(/^[A-Za-z_][A-Za-z0-9_]*/);
      if (!match) throw new Error('Invalid identifier in formula.');
      tokens.push({ type: 'identifier', value: match[0] }); index += match[0].length; continue;
    }
    if ('+-*/'.includes(char)) tokens.push({ type: 'operator', value: char });
    else if (char === '(') tokens.push({ type: 'leftParen', value: char });
    else if (char === ')') tokens.push({ type: 'rightParen', value: char });
    else if (char === ',') tokens.push({ type: 'comma', value: char });
    else throw new Error('Formula contains an unsupported character.');
    index += 1;
  }
  return tokens;
}

export function normalizeVariableName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

export function evaluateFormula(formula: string, values: Record<string, number>): FormulaEvaluation {
  const tokens = tokenize(formula);
  const variables = tokens.filter(token => token.type === 'identifier' && !FUNCTIONS[token.value.toUpperCase()]).map(token => token.value);
  let position = 0;

  function primary(): number {
    const token = tokens[position++];
    if (!token) throw new Error('Formula is incomplete.');
    if (token.type === 'number') return Number(token.value);
    if (token.type === 'identifier') {
      const functionName = token.value.toUpperCase();
      if (tokens[position]?.type === 'leftParen' && FUNCTIONS[functionName]) {
        position += 1;
        const args: number[] = [];
        if (tokens[position]?.type !== 'rightParen') {
          while (true) {
            args.push(expression());
            if (tokens[position]?.type !== 'comma') break;
            position += 1;
          }
        }
        if (tokens[position]?.type !== 'rightParen') throw new Error('Function call is incomplete.');
        position += 1;
        const result = FUNCTIONS[functionName](args);
        if (!Number.isFinite(result)) throw new Error('Formula produced an invalid result.');
        return result;
      }
      const key = normalizeVariableName(token.value);
      const value = values[token.value] ?? values[key];
      if (value === undefined) throw new Error(`Missing value for ${token.value}.`);
      return value;
    }
    if (token.type === 'leftParen') {
      const result = expression();
      if (tokens[position]?.type !== 'rightParen') throw new Error('Parenthesis is incomplete.');
      position += 1;
      return result;
    }
    if (token.type === 'operator' && token.value === '-') return -primary();
    throw new Error('Unexpected token in formula.');
  }

  function term(): number {
    let result = primary();
    while (tokens[position]?.type === 'operator' && ['*', '/'].includes(tokens[position].value)) {
      const operator = tokens[position++].value;
      const right = primary();
      if (operator === '/' && right === 0) throw new Error('Cannot divide by zero.');
      result = operator === '*' ? result * right : result / right;
    }
    return result;
  }

  function expression(): number {
    let result = term();
    while (tokens[position]?.type === 'operator' && ['+', '-'].includes(tokens[position].value)) {
      const operator = tokens[position++].value;
      const right = term();
      result = operator === '+' ? result + right : result - right;
    }
    return result;
  }

  const result = expression();
  if (position !== tokens.length || !Number.isFinite(result)) throw new Error('Formula could not be evaluated safely.');
  return { result, variables };
}
