#include <iostream>
#include <string>
#include <vector>
#include <set>
#include <stdexcept>

#include "crow.h"
#include <nlohmann/json.hpp>

#include "../include/NFA.h"
#include "../include/NFAValidator.h"
#include "../include/SubsetConstruction.h"
#include "../include/StringSimulation.h"

using namespace std;
using json = nlohmann::json;

// Convert a set of integer states into a JSON array.
json stateToJson(const set<int>& states) {
    json result = json::array();

    for (int state : states) {
        result.push_back(state);
    }

    return result;
}

// Convert a character into a JSON symbol.
string symbolToString(char symbol) {
    if (symbol == EPSILON) {
        return "eps";
    }

    return string(1, symbol);
}

// Convert JSON input into our C++ NFA.
NFA jsonToNFA(const json& data) {

    if (!data.is_object()) {
        throw runtime_error("Request body must be a JSON object.");
    }

    NFA nfa;

    if (!data.contains("states") || !data["states"].is_array()) {
        throw runtime_error("'states' must be an array.");
    }

    if (!data.contains("alphabet") || !data["alphabet"].is_array()) {
        throw runtime_error("'alphabet' must be an array.");
    }

    if (!data.contains("start_state") ||
        !data["start_state"].is_number_integer()) {
        throw runtime_error("'start_state' must be an integer.");
    }

    if (!data.contains("final_states") ||
        !data["final_states"].is_array()) {
        throw runtime_error("'final_states' must be an array.");
    }

    if (!data.contains("transitions") ||
        !data["transitions"].is_array()) {
        throw runtime_error("'transitions' must be an array.");
    }

    // Read states.
    for (const auto& state : data["states"]) {

        if (!state.is_number_integer()) {
            throw runtime_error("Every state must be an integer.");
        }

        nfa.states.insert(state.get<int>());
    }

    // Read alphabet.
    for (const auto& symbol : data["alphabet"]) {

        if (!symbol.is_string()) {
            throw runtime_error("Alphabet symbols must be strings.");
        }

        string value = symbol.get<string>();

        if (value == "eps" || value == "epsilon" || value == "ε" || value == "\xce\xbb") {
            throw runtime_error(
                "Epsilon ('eps' or 'ε') must not be included in the input alphabet."
            );
        }

        if (value.size() != 1 || value[0] == EPSILON) {
            throw runtime_error(
                "Each alphabet symbol must be a single non-empty character."
            );
        }

        nfa.alphabet.insert(value[0]);
    }

    // Read start state.
    nfa.startState = data["start_state"].get<int>();

    // Read final states.
    for (const auto& state : data["final_states"]) {

        if (!state.is_number_integer()) {
            throw runtime_error("Every final state must be an integer.");
        }

        nfa.finalStates.insert(state.get<int>());
    }

    // Read transitions.
    for (const auto& transition : data["transitions"]) {

        if (!transition.is_object() ||
            !transition.contains("from") ||
            !transition.contains("to") ||
            !transition.contains("symbol")) {

            throw runtime_error(
                "Each transition needs from, to and symbol fields."
            );
        }

        if (!transition["from"].is_number_integer() ||
            !transition["to"].is_number_integer() ||
            !transition["symbol"].is_string()) {

            throw runtime_error("Invalid transition field types.");
        }

        int from = transition["from"].get<int>();
        int to = transition["to"].get<int>();

        string symbolText =
            transition["symbol"].get<string>();

        char symbol;

        if (symbolText == "eps" || symbolText == "epsilon" ||
            symbolText == "ε" || symbolText == "\xce\xbb") {
            symbol = EPSILON;
        }
        else if (symbolText.size() == 1) {
            symbol = symbolText[0];
        }
        else {
            throw runtime_error(
                "Transition symbol must be one character or eps / ε."
            );
        }

        nfa.transitions.push_back({from, to, symbol});
    }

    return nfa;
}

// Convert conversion history into JSON.
json historyToJson(const vector<ConversionStep>& steps) {

    json history = json::array();

    for (const auto& step : steps) {

        json item;

        item["step_number"] = step.stepNumber;
        item["operation"] = step.operation;
        item["current_state"] = stateToJson(step.currentState);
        item["symbol"] = symbolToString(step.symbol);
        item["moved_states"] = stateToJson(step.movedStates);
        item["closure_states"] = stateToJson(step.closureStates);
        item["next_state"] = stateToJson(step.nextState);
        item["description"] = step.description;

        history.push_back(item);
    }

    return history;
}

// Convert DFA into JSON.
json dfaToJson(const DFA& dfa) {

    json result;

    result["states"] = json::array();
    result["alphabet"] = json::array();
    result["start_state"] = stateToJson(dfa.startState);
    result["final_states"] = json::array();
    result["transitions"] = json::array();

    for (const auto& state : dfa.states) {
        result["states"].push_back(stateToJson(state));
    }

    for (char symbol : dfa.alphabet) {
        result["alphabet"].push_back(string(1, symbol));
    }

    for (const auto& state : dfa.finalStates) {
        result["final_states"].push_back(stateToJson(state));
    }

    for (const auto& transition : dfa.transitions) {

        result["transitions"].push_back({
            {"from", stateToJson(transition.from)},
            {"to", stateToJson(transition.to)},
            {"symbol", string(1, transition.symbol)}
        });
    }

    return result;
}

// Add JSON and CORS response headers.
crow::response makeJsonResponse(int status, const json& body) {

    crow::response response(status, body.dump());

    response.set_header("Content-Type", "application/json");
    response.set_header("Access-Control-Allow-Origin", "*");
    response.set_header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, DELETE"
    );
    response.set_header(
        "Access-Control-Allow-Headers",
        "*"
    );

    return response;
}

// Clean preflight OPTIONS response (200 OK with no body and full CORS headers)
crow::response makeOptionsResponse() {
    crow::response response(200);
    response.set_header("Access-Control-Allow-Origin", "*");
    response.set_header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, DELETE"
    );
    response.set_header(
        "Access-Control-Allow-Headers",
        "*"
    );
    return response;
}

int main() {

    crow::SimpleApp app;

    // Health check endpoint with GET and OPTIONS support.
    CROW_ROUTE(app, "/api/health")
    .methods("GET"_method, "OPTIONS"_method)
    ([&]() {

        return makeJsonResponse(200, {
            {"status", "ok"},
            {"message", "Automata API is running"}
        });
    });

    // NFA to DFA conversion endpoint with full CORS preflight support.
    CROW_ROUTE(app, "/api/convert")
    .methods("POST"_method, "OPTIONS"_method)
    ([&](const crow::request& request) {

        if (request.method == "OPTIONS"_method) {
            return makeOptionsResponse();
        }

        try {

            json data = json::parse(request.body);

            NFA nfa = jsonToNFA(data);

            ConversionResult conversion =
                convertToDFAWithHistory(nfa);

            if (!conversion.validation.isValid) {

                json errors = json::array();

                for (const string& error :
                     conversion.validation.errors) {

                    errors.push_back(error);
                }

                return makeJsonResponse(400, {
                    {"success", false},
                    {"errors", errors}
                });
            }

            return makeJsonResponse(200, {
                {"success", true},
                {"dfa", dfaToJson(conversion.dfa)},
                {"history", historyToJson(conversion.steps)}
            });
        }
        catch (const exception& error) {

            return makeJsonResponse(400, {
                {"success", false},
                {"error", error.what()}
            });
        }
        catch (...) {
            return makeJsonResponse(500, {
                {"success", false},
                {"error", "Internal server error occurred."}
            });
        }
    });

    // String simulation endpoint with full CORS preflight support.
    CROW_ROUTE(app, "/api/simulate")
    .methods("POST"_method, "OPTIONS"_method)
    ([&](const crow::request& request) {

        if (request.method == "OPTIONS"_method) {
            return makeOptionsResponse();
        }

        try {

            json data = json::parse(request.body);

            if (!data.contains("input") ||
                !data["input"].is_string()) {

                throw runtime_error(
                    "'input' must be a string."
                );
            }

            NFA nfa = jsonToNFA(data);

            ConversionResult conversion =
                convertToDFAWithHistory(nfa);

            if (!conversion.validation.isValid) {

                json errors = json::array();

                for (const string& error :
                     conversion.validation.errors) {

                    errors.push_back(error);
                }

                return makeJsonResponse(400, {
                    {"success", false},
                    {"errors", errors}
                });
            }

            string input = data["input"].get<string>();

            StringSimulationResult simulation =
                simulateString(conversion.dfa, input);

            if (!simulation.isValid) {

                return makeJsonResponse(400, {
                    {"success", false},
                    {"error", simulation.errorMessage}
                });
            }

            json trace = json::array();

            for (const auto& step : simulation.steps) {

                trace.push_back({
                    {"step_number", step.stepNumber},
                    {"current_state",
                     stateToJson(step.currentState)},
                    {"symbol", string(1, step.symbol)},
                    {"next_state",
                     stateToJson(step.nextState)}
                });
            }

            return makeJsonResponse(200, {
                {"success", true},
                {"input", input},
                {"accepted", simulation.accepted},
                {"final_state", stateToJson(simulation.finalState)},
                {"trace", trace}
            });
        }
        catch (const exception& error) {

            return makeJsonResponse(400, {
                {"success", false},
                {"error", error.what()}
            });
        }
        catch (...) {
            return makeJsonResponse(500, {
                {"success", false},
                {"error", "Internal server error occurred."}
            });
        }
    });



    cout << "====================================\n";
    cout << "     AUTOMATA SIMULATOR API\n";
    cout << "====================================\n";
    cout << "Server: http://localhost:18080\n";
    cout << "Health: http://localhost:18080/api/health\n";
    cout << "====================================\n";

    app.bindaddr("0.0.0.0")
       .port(18080)
       .multithreaded()
       .run();

    return 0;
}
