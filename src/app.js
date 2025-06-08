   (function() {
      const display = document.getElementById('display');
      const buttons = document.querySelectorAll('button');
      let currentInput = '';
      let resetNext = false;

      function updateDisplay(value) {
        display.textContent = value || '0';
      }

      function isOperator(char) {
        return ['+', '-', '*', '/', '%'].includes(char);
      }

      function sanitizeExpression(expr) {
        return expr.replace(/[^0-9+\-*/%.]/g, '');
      }

      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const number = button.getAttribute('data-number');
          const operator = button.getAttribute('data-operator');
          const id = button.id;

          if (id === 'clear') {
            currentInput = '';
            updateDisplay(currentInput);
            resetNext = false;
            return;
          }

          if (id === 'backspace') {
            if (resetNext) {
              currentInput = '';
              resetNext = false;
            } else {
              currentInput = currentInput.slice(0, -1);
            }
            updateDisplay(currentInput);
            return;
          }

          if (id === 'equals') {
            if (!currentInput) return;
            try {
              let expression = currentInput.replace(/÷/g, '/').replace(/×/g, '*');
              expression = sanitizeExpression(expression);

              let result = Function('"use strict";return (' + expression + ')')();

              if (typeof result === 'number' && !isNaN(result)) {
                result = Math.round((result + Number.EPSILON) * 1e12) / 1e12;
                updateDisplay(result);
                currentInput = result.toString();
                resetNext = true;
              } else {
                updateDisplay('Error');
                currentInput = '';
              }
            } catch (e) {
              updateDisplay('Error');
              currentInput = '';
            }
            return;
          }

          if (number !== null) {
            if (resetNext) {
              currentInput = '';
              resetNext = false;
            }
            if (number === '.') {
              const parts = currentInput.split(/[\+\-\*\/\%]/);
              const lastPart = parts[parts.length - 1];
              if (lastPart.includes('.')) return;
              if (lastPart === '') currentInput += '0';
            }
            currentInput += number;
            updateDisplay(currentInput);
            return;
          }

          if (operator !== null) {
            if (resetNext) resetNext = false;
            if (currentInput === '') {
              if (operator === '-') {
                currentInput = '-';
                updateDisplay(currentInput);
              }
              return;
            }
            if (isOperator(currentInput.slice(-1))) {
              currentInput = currentInput.slice(0, -1) + operator;
            } else {
              currentInput += operator;
            }
            updateDisplay(currentInput);
            return;
          }
        });
      });

      // Keyboard support
      window.addEventListener('keydown', (e) => {
        if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
          document.querySelector(`button[data-number="${e.key}"]`)?.click();
        } else if (['+', '-', '*', '/', '%'].includes(e.key)) {
          document.querySelector(`button[data-operator="${e.key}"]`)?.click();
        } else if (e.key === 'Enter' || e.key === '=') {
          document.getElementById('equals').click();
          e.preventDefault();
        } else if (e.key === 'Backspace') {
          document.getElementById('backspace').click();
        } else if (e.key.toLowerCase() === 'c') {
          document.getElementById('clear').click();
        }
      });
    })();