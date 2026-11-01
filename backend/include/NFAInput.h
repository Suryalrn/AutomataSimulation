#ifndef NFA_INPUT_H
#define NFA_INPUT_H

#include <iostream>
#include <limits>
#include <string>
#include "NFA.h"

using namespace std;

inline int readInteger(const string& prompt) {
    int value;

    while (true) {
        cout << prompt;

        if (cin >> value) {
            return value;
        }

        cout << "Invalid input. Enter an integer.\n";

        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
    }
}

inline bool inputNFA(NFA& nfa) {

    cout << "\n========== NFA INPUT ==========\n";

    // 1. Number of states
    int stateCount = readInteger("Enter number of states: ");

    if (stateCount <= 0 || stateCount > 1000) {
        cout << "State count must be between 1 and 1000.\n";
        return false;
    }

    for (int i = 0; i < stateCount; i++) {
        nfa.states.insert(i);
    }

    cout << "States: ";
    for (int state : nfa.states) {
        cout << "q" << state << " ";
    }
    cout << "\n";

    // 2. Alphabet
    string alphabetInput;

    cout << "Enter alphabet (example: ab), or - for empty alphabet: ";
    cin >> alphabetInput;

    if (alphabetInput != "-") {
        for (char symbol : alphabetInput) {
            if (symbol == EPSILON) {
                cout << "Invalid alphabet symbol.\n";
                return false;
            }

            nfa.alphabet.insert(symbol);
        }
    }

    // 3. Start state
    nfa.startState = readInteger("Enter start state ID: ");

    // 4. Final states
    int finalCount = readInteger("Enter number of final states: ");

    if (finalCount < 0 || finalCount > stateCount) {
        cout << "Invalid number of final states.\n";
        return false;
    }

    cout << "Enter final state IDs:\n";

    for (int i = 0; i < finalCount; i++) {
        int finalState = readInteger("Final state: ");
        nfa.finalStates.insert(finalState);
    }

    // 5. Transitions
    int transitionCount = readInteger("Enter number of transitions: ");

    if (transitionCount < 0 || transitionCount > 10000) {
        cout << "Invalid number of transitions.\n";
        return false;
    }

    cout << "\nEnter transitions in this format:\n";
    cout << "FROM SYMBOL TO\n";
    cout << "Example: 0 a 1\n";
    cout << "For epsilon, enter: eps or ε\n\n";

    for (int i = 0; i < transitionCount; i++) {

        int from, to;
        string symbolInput;

        cout << "Transition " << i + 1 << ": ";

        if (!(cin >> from >> symbolInput >> to)) {
            cout << "Invalid transition input.\n";
            return false;
        }

        char symbol;

        if (symbolInput == "eps" || symbolInput == "epsilon" ||
            symbolInput == "ε" || symbolInput == "\xce\xbb") {
            symbol = EPSILON;
        }
        else if (symbolInput.size() == 1) {
            symbol = symbolInput[0];
        }
        else {
            cout << "Enter a single character or eps / ε.\n";
            return false;
        }

        nfa.transitions.push_back({from, to, symbol});
    }

    return true;
}

#endif
