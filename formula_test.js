const evaluateFormula = (formula, contexto) => {
    let expresion = formula;
    const regex = /\{(\w+)\}/g;
    let match;

    while ((match = regex.exec(formula)) !== null) {
      const clave = match[1];
      const valor = contexto[clave] !== undefined ? contexto[clave] : 0;
      
      let valorNum;
      if (typeof valor === "boolean") {
        valorNum = valor ? 1 : 0;
      } else {
        valorNum = typeof valor === "number" ? valor : parseFloat(valor) || 0;
      }
      
      expresion = expresion.replaceAll(match[0], valorNum);
    }

    try {
      // Limpieza básica (permitiendo ? : > < = ! & |)
      if (/[^0-9+\-*/().\s?:><=!&|]/.test(expresion)) {
        console.log("Fallo Regex Guard:", expresion);
        return 0;
      }
      // eslint-disable-next-line no-eval
      return eval(expresion);
    } catch (e) {
      console.log("Error eval:", e);
      return 0;
    }
  };

const contexto = { aplicar10: true, ganancia: 100 };
console.log(evaluateFormula("{aplicar10} ? ({ganancia} * 0.10) : 0", contexto));

const contexto2 = { aplicar10: false, ganancia: 100 };
console.log(evaluateFormula("{aplicar10} ? ({ganancia} * 0.10) : 0", contexto2));
