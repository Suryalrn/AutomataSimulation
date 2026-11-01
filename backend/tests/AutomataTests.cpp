#include <iostream>
#include <string>
#include <set>

#include "../include/NFA.h"
#include "../include/NFAValidator.h"
#include "../include/SubsetConstruction.h"
#include "../include/StringSimulation.h"

using namespace std;

int passed = 0;
int failed = 0;

void check(bool condition, const string& testName) {
    if (condition) {
        cout << "[PASS] " << testName << "\n";
        passed++;
    } else {
        cout << "[FAIL] " << testName << "\n";
        failed++;
    }
}

// Test 1: Epsilon cycle
void testEpsilonCycle() {
    NFA nfa;
    nfa.states = {0, 1};
    nfa.alphabet = {'a'};
    nfa.startState = 0;
    nfa.finalStates = {1};

    nfa.transitions.push_back({0, 1, EPSILON});
    nfa.transitions.push_back({1, 0, EPSILON});

    ConversionResult result = convertToDFAWithHistory(nfa);

    check(result.validation.isValid, "Epsilon cycle: validation");
    check(result.dfa.startState == set<int>({0, 1}),
          "Epsilon cycle: closure contains both states");
}

// Test 2: Multiple final states
void testMultipleFinalStates() {
    NFA nfa;
    nfa.states = {0, 1, 2};
    nfa.alphabet = {'a'};
    nfa.startState = 0;
    nfa.finalStates = {1, 2};

    nfa.transitions.push_back({0, 1, 'a'});
    nfa.transitions.push_back({0, 2, 'a'});

    ConversionResult result = convertToDFAWithHistory(nfa);

    check(result.validation.isValid, "Multiple final states: validation");
    check(result.dfa.finalStates.count({1, 2}) == 1,
          "Multiple final states: accepting subset");
}

// Test 3: Empty alphabet
void testEmptyAlphabet() {
    NFA nfa;
    nfa.states = {0};
    nfa.startState = 0;
    nfa.finalStates = {0};

    ConversionResult result = convertToDFAWithHistory(nfa);

    check(result.validation.isValid, "Empty alphabet: validation");
    check(result.dfa.states.size() == 1,
          "Empty alphabet: one DFA state");
    check(result.dfa.transitions.empty(),
          "Empty alphabet: no transitions");
}

// Test 4: Complete DFA and dead state
void testCompleteDFA() {
    NFA nfa;
    nfa.states = {0, 1};
    nfa.alphabet = {'a', 'b'};
    nfa.startState = 0;
    nfa.finalStates = {1};

    nfa.transitions.push_back({0, 1, 'a'});

    ConversionResult result = convertToDFAWithHistory(nfa);

    bool complete = true;

    for (const auto& state : result.dfa.states) {
        for (char symbol : result.dfa.alphabet) {

            int count = 0;

            for (const auto& transition : result.dfa.transitions) {
                if (transition.from == state &&
                    transition.symbol == symbol) {
                    count++;
                }
            }

            if (count != 1) {
                complete = false;
            }
        }
    }

    check(result.validation.isValid, "Complete DFA: validation");
    check(complete, "Complete DFA: exactly one transition per symbol");
    check(result.dfa.states.count({}) == 1,
          "Complete DFA: empty-set state exists");
}

// Test 5: Invalid transition destination
void testInvalidNFA() {
    NFA nfa;
    nfa.states = {0, 1};
    nfa.alphabet = {'a'};
    nfa.startState = 0;
    nfa.finalStates = {1};

    nfa.transitions.push_back({0, 99, 'a'});

    ConversionResult result = convertToDFAWithHistory(nfa);

    check(!result.validation.isValid,
          "Invalid NFA: nonexistent destination detected");

    check(result.dfa.states.empty(),
          "Invalid NFA: conversion stopped");
}

// Test 6: String acceptance and rejection
void testStringSimulation() {
    NFA nfa;
    nfa.states = {0, 1};
    nfa.alphabet = {'a', 'b'};
    nfa.startState = 0;
    nfa.finalStates = {1};

    nfa.transitions.push_back({0, 1, 'a'});

    ConversionResult conversion = convertToDFAWithHistory(nfa);

    StringSimulationResult accepted =
        simulateString(conversion.dfa, "a");

    StringSimulationResult rejected =
        simulateString(conversion.dfa, "b");

    StringSimulationResult invalid =
        simulateString(conversion.dfa, "c");

    check(accepted.isValid && accepted.accepted,
          "String simulation: accepts a");

    check(rejected.isValid && !rejected.accepted,
          "String simulation: rejects b");

    check(!invalid.isValid,
          "String simulation: rejects invalid alphabet symbol");
}

int main() {

    cout << "\n========== AUTOMATA TEST SUITE ==========\n\n";

    testEpsilonCycle();
    testMultipleFinalStates();
    testEmptyAlphabet();
    testCompleteDFA();
    testInvalidNFA();
    testStringSimulation();

    cout << "\n========== TEST SUMMARY ==========\n";

    cout << "Passed: " << passed << "\n";
    cout << "Failed: " << failed << "\n";

    cout << "\n";

    if (failed == 0) {
        cout << "ALL TESTS PASSED!\n";
        return 0;
    }

    cout << "SOME TESTS FAILED!\n";
    return 1;
}