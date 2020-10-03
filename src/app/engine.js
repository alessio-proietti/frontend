//computation of turing machines 
import { TuringMachine, Quadruple } from 'grumle-turing';

export function compute(inputs, table) {
    
    // Create the quadruples
    const quadruples = [];
    let quadruple;

    while(table.length > 0) {
        quadruple = table.splice(0,4)
        quadruples.push(new Quadruple(quadruple[0], quadruple[1], quadruple[2], quadruple[3]));
    }

    // Instantiate the Turing Machine
    const turing = new TuringMachine(quadruples, inputs);

    const result = turing.start();

    return result;
}