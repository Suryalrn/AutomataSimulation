#ifndef DFA_H
#define DFA_H

#include <set>
#include <vector>
#include "NFA.h"

using namespace std;

struct DFATransition {
    set<int> from;
    set<int> to;
    char symbol;
};

struct DFA {

    // Each DFA state is a set of NFA states
    set<set<int>> states;

    // Input alphabet
    set<char> alphabet;

    // Initial DFA state
    set<int> startState;

    // Final DFA states
    set<set<int>> finalStates;

    // DFA transitions
    vector<DFATransition> transitions;
};

#endif