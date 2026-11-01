#ifndef CONVERSION_STEP_H
#define CONVERSION_STEP_H

#include <set>
#include <string>

using namespace std;

struct ConversionStep {

    int stepNumber;

    string operation;

    set<int> currentState;

    char symbol;

    set<int> movedStates;

    set<int> closureStates;

    set<int> nextState;

    string description;
};

#endif