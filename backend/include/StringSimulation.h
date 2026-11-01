#ifndef STRING_SIMULATION_H
#define STRING_SIMULATION_H

#include <set>
#include <vector>
#include <string>

#include "DFA.h"

using namespace std;

struct SimulationStep {
    int stepNumber;
    set<int> currentState;
    char symbol;
    set<int> nextState;
};

struct StringSimulationResult {
    bool isValid = true;
    bool accepted = false;
    string errorMessage;
    string inputString;
    set<int> finalState;
    vector<SimulationStep> steps;
};

inline StringSimulationResult simulateString(
    const DFA& dfa,
    const string& input
) {
    StringSimulationResult result;
    result.inputString = input;

    set<int> currentState = dfa.startState;

    for (size_t i = 0; i < input.size(); i++) {

        char symbol = input[i];

        // Check whether the symbol belongs to the alphabet.
        if (dfa.alphabet.find(symbol) == dfa.alphabet.end()) {
            result.isValid = false;
            result.errorMessage =
                string("Invalid input symbol: '") + symbol + "'";
            return result;
        }

        // Find the corresponding DFA transition.
        bool transitionFound = false;
        set<int> nextState;

        for (const auto& transition : dfa.transitions) {

            if (transition.from == currentState &&
                transition.symbol == symbol) {

                nextState = transition.to;
                transitionFound = true;
                break;
            }
        }

        if (!transitionFound) {
            result.isValid = false;
            result.errorMessage =
                "DFA transition is missing for the current state and symbol.";
            return result;
        }

        result.steps.push_back({
            static_cast<int>(i + 1),
            currentState,
            symbol,
            nextState
        });

        currentState = nextState;
    }

    result.finalState = currentState;

    // A string is accepted if the final reached state is accepting.
    result.accepted =
        dfa.finalStates.find(currentState) != dfa.finalStates.end();

    return result;
}

#endif