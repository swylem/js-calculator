const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;
const subtract = (a, b) => a - b;
const add = (a, b) => a + b;
const mod = (a, b) => a % b;
const pow = (base, power) => base ** power;


const operate = (a, b, operation) => {
    let answer = "undefined";

    if(operation === '+') {
        answer = add(a, b);
    } else if(operation === '-') {
        answer = subtract(a, b);
    } else if(operation === '÷') {
        answer = divide(a, b);
    } else if(operation === '×') {
        answer = multiply(a, b);
    } else if(operation === '%') {
        answer = mod(a, b);
    } else if(operation === '^') {
        answer = pow(a, b);
    }

    return answer;
}

const preprocessTokenizedStrings = (tokenizedStrings) => {
    for(let i = 0 ; i < tokenizedStrings.length ; i++) {

     
        if(tokenizedStrings[i] === '-' && tokenizedStrings[i+1] === '-') {
            console.log('two -', i);
            tokenizedStrings.splice(i, 2, '+');
            i--;
        } else if(isClosingBracket(tokenizedStrings[i]) && parseInt(tokenizedStrings[i+1]) < 0) {
            console.log(') and negative number', i);
            tokenizedStrings.splice(i+1, 0, '+');
            i--;
        } else if(isClosingBracket(tokenizedStrings[i]) && !isNaN(parseInt(tokenizedStrings[i+1]))) {
            console.log('closing bracket and any number');
            tokenizedStrings.splice(i+1, 0, '×');
            i++;
        } else if(tokenizedStrings[i] === '-' && parseInt(tokenizedStrings[i+1]) < 0) {
            console.log('- and negative number', i);
            tokenizedStrings[i] = '+';
            tokenizedStrings[i+1] = `${-1*parseInt(tokenizedStrings[i+1])}`;
            i--;
        } else if(tokenizedStrings[i] === '+' && tokenizedStrings[i+1] === '-') {
            console.log('+ and -', i);
            tokenizedStrings.splice(i, 2, '-');
            i--;
        } else if(isAnOperator(tokenizedStrings[i]) && isOpeningBracket(tokenizedStrings[i+1])) {
            console.log('no number/opening bracket before operator and then a bracket', i);
            if(i == 0 || isNaN(parseInt(tokenizedStrings[i-1]))) {
                if(tokenizedStrings[i] !== '-') {
                    tokenizedStrings.splice(i, 1);
                } else {
                    tokenizedStrings[i] = '-1';
                }
                i--;
            }
        } else if(isAnOperator(tokenizedStrings[i]) && tokenizedStrings[i] === tokenizedStrings[i+1]) {
            console.log('two operators', i);
            tokenizedStrings.splice(i, 1);
            i--;
        } else if(i == 0 && tokenizedStrings[i] == '+') {
            console.log('leading +', i);
            tokenizedStrings.splice(i, 1);
            i--;
        } else if(i > 0 && parseInt(tokenizedStrings[i]) < 0 && (!isAnOperator(tokenizedStrings[i-1]) && !isABracket(tokenizedStrings[i-1]))) {
            console.log('any number + negative number', i);
            tokenizedStrings.splice(i, 0, '+');
            i++;
        }
        else if(isABracket(tokenizedStrings[i]) && areBracketsOpposite(tokenizedStrings[i], tokenizedStrings[i+1])
                || !isNaN(parseInt(tokenizedStrings[i])) && isOpeningBracket(tokenizedStrings[i+1])) {
            
            console.log('two opposite brackets or number followed by opening bracket', i);
            tokenizedStrings.splice(i+1, 0, '×');
            i--;
        }
        else if(tokenizedStrings[i] === '-' && parseInt(tokenizedStrings[i+1]) < 0) {
            console.log('same as "- and negative number"', i);
            tokenizedStrings.splice(i, 2, `${-1*parseInt(tokenizedStrings[i+1])}`);
            i--;
        }
    }

    return tokenizedStrings;
}

const getRegex = () => /^(-?\d+\.?\d+|-?\d+|[\)|\(|+|\-|÷|×|%|^])$/g;

const verifyString = (str) => getRegex().test(str);

const tokenizeString = (str) =>  {
    let tokenizedStrings = [];
    const regex = getRegex();
    let token;

    while((token = regex.exec(str)) !== null) {
        tokenizedStrings.push(token[0]);
    }

    tokenizedStrings = preprocessTokenizedStrings(tokenizedStrings);
    
    return tokenizedStrings;
}



const getScreen = () => document.querySelector('.container .screen');
const getActiveScreen = () => getScreen().querySelector('.active');
const getPreviousScreen = () => getScreen().querySelector('.previous');

const getClearButton = () => document.querySelector('.buttons .clear');
const getDeleteButton = () => document.querySelector('.buttons .delete');
const getEqualsButton = () => document.querySelector('.buttons .equals');
const getScreenEnabledButtons = () => document.querySelectorAll('.buttons .screen-enabled');


const clearScreen = () => {
    const screen = getScreen();

    for(let child of screen.childNodes) {
        child.value = '';
    }
}

const deleteLast = () => {
    const activeScreen = getActiveScreen();
    const activeText = activeScreen.value.replaceAll(' ', '').replaceAll('\n', '');

    if(activeText.length <= 0) return;
    else if(activeText.includes('SyntaxError')) activeScreen.value = '';
    else activeScreen.value = activeText.slice(0, activeText.length-1);
}

const updateScreen = (e) => {
    const value = e.target.value;
    const activeScreen = getActiveScreen();
    activeScreen.value = activeScreen.value + value;
}

const getPrecedenceOfOperator = (operator) => {
    let precedence = 0;

    if(operator === '^') precedence = 3;
    else if(operator === '÷' || operator === '×' || operator === '%') precedence = 2;
    else if(operator === '+' || operator === '-') precedence = 1;
    
    return precedence;
}

const isAnOperator = (character) => {
    return (
        character === '+' || character === '-' ||
        character === '÷' || character === '×' ||
        character === '%' || character === '^'
    );
}

const isABracket = (character) => {
    return (
        character === '(' || character === ')'
    );
}

const areBracketsOpposite = (firstBracket, secondBracket) => {
    return (
        firstBracket === ')' && secondBracket === '('
    );
}

const isOpeningBracket = (bracket) => {
    return (
        bracket === '('
    );
}

const isClosingBracket = (bracket) => {
    return (
        bracket === ')'
    );
}

const infixToPostfix = (infix) => {
    const stack = [];
    const postfix = [];

    infix.forEach((character) => {
        if(isAnOperator(character)) {
            while(stack.length !== 0 && stack[stack.length - 1] !== '(' && getPrecedenceOfOperator(character) <= getPrecedenceOfOperator(stack[stack.length - 1])) {
                postfix.push(stack.pop());
            }
            stack.push(character);
        } else if(character === '(') {
            stack.push(character);  
        } else if(character === ')') {
            while(stack.length !== 0 && stack[stack.length - 1] !== '(') {
                postfix.push(stack.pop());
            }
            stack.pop();
        } else {
            postfix.push(character);
        } 
    });

    while(stack.length !== 0) {
        postfix.push(stack.pop());
    }

    return postfix;
}

const evaluatePostfix = (postfix) => {
    const stack = [];
    postfix.forEach(character => {
        if(isAnOperator(character)) {
            firstNumber = stack.pop();
            secondNumber = stack.pop();

            const result = operate(secondNumber, firstNumber, character);
        
            stack.push(result);
        } else {
            stack.push(parseFloat(character));
        }
    });

    return stack[0];
}

const solve = (e) => {
    const inputString = getActiveScreen().value;
    if(!verifyString(inputString)) return;
    
    const tokenizedString = tokenizeString(inputString);
    const postfix = infixToPostfix(tokenizedString);
    let answer = evaluatePostfix(postfix);

    if(isNaN(answer)) {
        answer = 'Syntax Error';
    }
    
    const previousScreen = getPreviousScreen();
    const activeScreen = getActiveScreen();
    
    if(!isNaN(answer)) {
        previousScreen.value = `${inputString} =`;
    }
    
    activeScreen.value = answer;
}

getClearButton().addEventListener('click', clearScreen);
getDeleteButton().addEventListener('click', deleteLast);
getEqualsButton().addEventListener('click', solve);
getScreenEnabledButtons().forEach(button => button.addEventListener('click', updateScreen));