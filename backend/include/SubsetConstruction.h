#ifndef SUBSET_CONSTRUCTION_H
#define SUBSET_CONSTRUCTION_H

#include <queue>
#include <vector>
#include <string>

#include "DFA.h"
#include "Move.h"
#include "EpsilonClosure.h"
#include "ConversionStep.h"
#include "NFAValidator.h"

using namespace std;

// Contains DFA, conversion history and validation result.
struct ConversionResult {
    DFA dfa;
    vector<ConversionStep> steps;
    ValidationResult validation;
};

// Maximum number of DFA states allowed to protect against memory exhaustion (state explosion).
constexpr size_t MAX_DFA_STATES = 500;

inline ConversionResult convertToDFAWithHistory(const NFA& nfa) {

    ConversionResult result;

    // STEP 0: Validate NFA.
    result.validation = validateNFA(nfa);

    if (!result.validation.isValid) {
        return result;
    }

    DFA& dfa = result.dfa;

    int stepNumber = 1;

    dfa.alphabet = nfa.alphabet;

    // STEP 1: Initial epsilon closure.
    dfa.startState = epsilonClosure(nfa, nfa.startState);

    dfa.states.insert(dfa.startState);

    result.steps.push_back({
        stepNumber++,
        "INITIAL_CLOSURE",
        {nfa.startState},
        EPSILON,
        {},
        dfa.startState,
        dfa.startState,
        "Calculate epsilon closure of initial state"
    });

    queue<set<int>> pending;
    pending.push(dfa.startState);

    // STEP 2: Process discovered DFA states.
    while (!pending.empty()) {

        set<int> currentState = pending.front();
        pending.pop();

        for (char symbol : nfa.alphabet) {

            // STEP 3: Move operation.
            set<int> movedStates = move(nfa, currentState, symbol);

            result.steps.push_back({
                stepNumber++,
                "MOVE",
                currentState,
                symbol,
                movedStates,
                {},
                {},
                "Calculate reachable states using input symbol"
            });

            // STEP 4: Epsilon closure.
            set<int> nextState = epsilonClosure(nfa, movedStates);

            result.steps.push_back({
                stepNumber++,
                "EPSILON_CLOSURE",
                currentState,
                symbol,
                movedStates,
                nextState,
                nextState,
                "Calculate epsilon closure of moved states"
            });

            // STEP 5: Discover new DFA states.
            bool isNew = dfa.states.find(nextState) == dfa.states.end();

            if (isNew) {
                if (dfa.states.size() >= MAX_DFA_STATES) {
                    result.validation.addError(
                        "DFA state limit reached: subset construction exceeded " +
                        to_string(MAX_DFA_STATES) + " states (state explosion protection)."
                    );
                    return result;
                }
                dfa.states.insert(nextState);
                pending.push(nextState);
            }

            result.steps.push_back({
                stepNumber++,
                isNew ? "NEW_STATE" : "EXISTING_STATE",
                currentState,
                symbol,
                movedStates,
                nextState,
                nextState,
                isNew
                    ? "New DFA state discovered"
                    : "DFA state already exists"
            });

            // STEP 6: Store transition.
            dfa.transitions.push_back({
                currentState,
                nextState,
                symbol
            });
        }
    }

    // STEP 7: Identify final DFA states.
    for (const auto& dfaState : dfa.states) {

        for (int state : dfaState) {

            if (nfa.finalStates.count(state)) {
                dfa.finalStates.insert(dfaState);
                break;
            }
        }
    }

    result.steps.push_back({
        stepNumber++,
        "FINAL_STATES",
        {},
        EPSILON,
        {},
        {},
        {},
        "Identify all accepting DFA states"
    });

    return result;
}

// Preserve original conversion interface.
inline DFA convertToDFA(const NFA& nfa) {
    return convertToDFAWithHistory(nfa).dfa;
}

#endif
