#include <iostream>
#include "../include/NFA.h"
#include "../include/SubsetConstruction.h"
#include "../include/StringSimulation.h"

using namespace std;

void printState(const set<int>& state) {
    cout << "{ ";

    for (int s : state) {
        cout << "q" << s << " ";
    }

    cout << "}";
}

int main() {

    // Create test NFA.
    NFA nfa;

    nfa.states = {0, 1, 2};
    nfa.alphabet = {'a', 'b'};
    nfa.startState = 0;
    nfa.finalStates = {2};

    nfa.transitions.push_back({0, 1, EPSILON});
    nfa.transitions.push_back({1, 2, 'a'});

    // Convert NFA to DFA.
    ConversionResult conversion = convertToDFAWithHistory(nfa);

    if (!conversion.validation.isValid) {
        cout << "NFA validation failed.\n";
        return 1;
    }

    // Test input string.
    string input;

    cout << "Enter a string (use # for empty string): ";
    cin >> input;

    if (input == "#") {
        input = "";
    }

    StringSimulationResult result =
        simulateString(conversion.dfa, input);

    if (!result.isValid) {
        cout << "Invalid input: " << result.errorMessage << "\n";
        return 1;
    }

    cout << "\n========== STRING SIMULATION ==========\n";

    cout << "Input string: "
         << (input.empty() ? "EMPTY STRING (epsilon)" : input)
         << "\n";

    cout << "\nExecution trace:\n";

    for (const auto& step : result.steps) {

        cout << "\nStep " << step.stepNumber << "\n";

        printState(step.currentState);

        cout << " --" << step.symbol << "--> ";

        printState(step.nextState);

        cout << "\n";
    }

    cout << "\nFinal state: ";
    printState(result.finalState);

    cout << "\n";

    if (result.accepted) {
        cout << "\nRESULT: STRING ACCEPTED\n";
    }
    else {
        cout << "\nRESULT: STRING REJECTED\n";
    }

    return 0;
}