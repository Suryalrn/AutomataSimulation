#ifndef NFA_VALIDATOR_H
#define NFA_VALIDATOR_H

#include "NFA.h"
#include "ValidationResult.h"

#include <string>

using namespace std;

inline ValidationResult validateNFA(const NFA& nfa) {

    ValidationResult result;

    // Rule 1: NFA must contain at least one state.
    if (nfa.states.empty()) {
        result.addError("NFA must contain at least one state.");
    }

    // Rule 2: Start state must exist.
    if (nfa.states.find(nfa.startState) == nfa.states.end()) {
        result.addError("Start state does not exist in the NFA.");
    }

    // Rule 3: At least one final state should exist.
    if (nfa.finalStates.empty()) {
        result.addError("NFA must contain at least one final state.");
    }

    // Rule 4: Every final state must exist.
    for (int finalState : nfa.finalStates) {
        if (nfa.states.find(finalState) == nfa.states.end()) {
            result.addError(
                "Final state q" + to_string(finalState) +
                " does not exist in the NFA."
            );
        }
    }

    // Rule 5: Every transition must start from an existing state.
    for (const auto& transition : nfa.transitions) {

        if (nfa.states.find(transition.from) == nfa.states.end()) {
            result.addError(
                "Transition source state q" +
                to_string(transition.from) +
                " does not exist."
            );
        }

        // Rule 6: Every transition must end at an existing state.
        if (nfa.states.find(transition.to) == nfa.states.end()) {
            result.addError(
                "Transition destination state q" +
                to_string(transition.to) +
                " does not exist."
            );
        }

        // Rule 7: Transition symbol must belong to alphabet,
        // unless it is epsilon.
        if (transition.symbol != EPSILON &&
            nfa.alphabet.find(transition.symbol) == nfa.alphabet.end()) {

            result.addError(
                string("Transition symbol '") +
                transition.symbol +
                "' is not present in the alphabet."
            );
        }
    }

    // Rule 8: Epsilon must not be part of the input alphabet.
    if (nfa.alphabet.find(EPSILON) != nfa.alphabet.end()) {
        result.addError(
            "Epsilon must not be included in the input alphabet."
        );
    }

    return result;
}

#endif