#include <iostream>

#include "../include/NFA.h"
#include "../include/NFAValidator.h"

using namespace std;

int main() {

    NFA nfa;

    nfa.states = {0, 1, 2};
    nfa.alphabet = {'a', 'b'};
    nfa.startState = 0;
    nfa.finalStates = {2};

    nfa.transitions.push_back({0, 1, EPSILON});
    nfa.transitions.push_back({1, 2, 'a'});

    ValidationResult result = validateNFA(nfa);

    if (result.isValid) {
        cout << "NFA is VALID!" << endl;
    }
    else {
        cout << "NFA is INVALID!" << endl;

        for (const string& error : result.errors) {
            cout << "- " << error << endl;
        }
    }

    return 0;
}