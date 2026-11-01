#include <iostream>

#include "../include/NFA.h"
#include "../include/DFA.h"
#include "../include/NFAInput.h"
#include "../include/NFAValidator.h"
#include "../include/SubsetConstruction.h"

using namespace std;

void printState(const set<int>& state) {

    cout << "{ ";

    for (int s : state) {
        cout << "q" << s << " ";
    }

    cout << "}";
}

void printDFA(const DFA& dfa) {

    cout << "\n========== FINAL DFA ==========\n";

    cout << "\nDFA States:\n";

    for (const auto& state : dfa.states) {
        printState(state);
        cout << "\n";
    }

    cout << "\nInitial DFA State:\n";
    printState(dfa.startState);

    cout << "\n\nFinal DFA States:\n";

    for (const auto& state : dfa.finalStates) {
        printState(state);
        cout << "\n";
    }

    cout << "\nDFA Transitions:\n";

    for (const auto& transition : dfa.transitions) {

        printState(transition.from);

        cout << " --" << transition.symbol << "--> ";

        printState(transition.to);

        cout << "\n";
    }
}

void printHistory(const vector<ConversionStep>& steps) {

    cout << "\n========== CONVERSION HISTORY ==========\n";

    for (const auto& step : steps) {

        cout << "\nStep " << step.stepNumber
             << " [" << step.operation << "]\n";

        cout << step.description << "\n";

        if (step.symbol != EPSILON) {
            cout << "Symbol: " << step.symbol << "\n";
        }

        cout << "Current state: ";
        printState(step.currentState);

        cout << "\nMove result: ";
        printState(step.movedStates);

        cout << "\nClosure result: ";
        printState(step.closureStates);

        cout << "\nNext state: ";
        printState(step.nextState);

        cout << "\n";
    }
}

int main() {

    NFA nfa;

    // Step 1: Get NFA from user.
    if (!inputNFA(nfa)) {
        cout << "\nFailed to read NFA input.\n";
        return 1;
    }

    // Step 2: Validate NFA.
    ValidationResult validation = validateNFA(nfa);

    if (!validation.isValid) {

        cout << "\n========== VALIDATION FAILED ==========\n";

        for (const string& error : validation.errors) {
            cout << "- " << error << "\n";
        }

        return 1;
    }

    cout << "\nNFA validation successful!\n";

    // Step 3: Convert NFA to DFA.
    ConversionResult result = convertToDFAWithHistory(nfa);

    // Step 4: Display history.
    printHistory(result.steps);

    // Step 5: Display final DFA.
    printDFA(result.dfa);

    return 0;
}