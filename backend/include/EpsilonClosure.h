#ifndef EPSILON_CLOSURE_H
#define EPSILON_CLOSURE_H

#include <set>
#include <vector>
#include "NFA.h"

using namespace std;

inline set<int> epsilonClosure(const NFA& nfa, int startState) {

    set<int> visited;
    vector<int> stack;

    // Start from the given state
    visited.insert(startState);
    stack.push_back(startState);

    // DFS traversal
    while (!stack.empty()) {

        int current = stack.back();
        stack.pop_back();

        // Explore all epsilon transitions
        for (const auto& transition : nfa.transitions) {

            if (transition.from == current &&
                transition.symbol == EPSILON) {

                int nextState = transition.to;

                // Avoid revisiting states
                if (visited.find(nextState) == visited.end()) {

                    visited.insert(nextState);
                    stack.push_back(nextState);
                }
            }
        }
    }

    return visited;
}

// Epsilon closure of a set of states
inline set<int> epsilonClosure(
    const NFA& nfa,
    const set<int>& states
) {

    set<int> result;

    for (int state : states) {

        set<int> closure = epsilonClosure(nfa, state);

        result.insert(closure.begin(), closure.end());
    }

    return result;
}

#endif