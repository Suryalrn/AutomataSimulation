#ifndef NFA_H
#define NFA_H

#include <iostream>
#include <set>
#include <vector>
#include "Transition.h"

using namespace std;

// Special symbol representing epsilon
constexpr char EPSILON = '\0';

struct NFA {

    // Set of all states
    set<int> states;

    // Input alphabet (epsilon is NOT included)
    set<char> alphabet;

    // Initial state
    int startState;

    // Set of final states
    set<int> finalStates;

    // All transitions
    vector<Transition> transitions;
};

#endif