#ifndef MOVE_H
#define MOVE_H

#include <set>
#include "NFA.h"

using namespace std;

inline set<int> move(
    const NFA& nfa,
    const set<int>& states,
    char symbol
) {

    set<int> result;

    for (int state : states) {

        for (const auto& transition : nfa.transitions) {

            if (transition.from == state &&
                transition.symbol == symbol) {

                result.insert(transition.to);
            }
        }
    }

    return result;
}

#endif