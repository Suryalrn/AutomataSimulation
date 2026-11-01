#ifndef VALIDATION_RESULT_H
#define VALIDATION_RESULT_H

#include <string>
#include <vector>

using namespace std;

struct ValidationResult {
    bool isValid = true;
    vector<string> errors;

    void addError(const string& message) {
        isValid = false;
        errors.push_back(message);
    }
};

#endif