# Automata Simulation

A C++ project for simulating and converting Finite Automata (NFA to DFA) using the Subset Construction algorithm, featuring epsilon-closure computation, string acceptance verification, and a REST API backend powered by Crow.

## Features

- **NFA Validation**: Validates user-defined transitions, states, and alphabet symbols.
- **$\varepsilon$-Closure Calculation**: Determines reachable states through epsilon transitions.
- **Subset Construction**: Converts non-deterministic finite automata (NFA) to equivalent deterministic finite automata (DFA).
- **String Simulation**: Traces input strings step-by-step through the resulting DFA to verify acceptance or rejection.
- **REST API Backend**: Crow-powered C++ web server providing endpoints for automata conversion and string simulation.
- **Interactive Frontend**: Client interface for visualizing state machines and simulation steps.

## Project Structure

```text
Automata Simulation/
├── backend/
│   ├── include/            # Header files (NFA, DFA, SubsetConstruction, StringSimulation, etc.)
│   ├── src/                # Implementation files and Crow REST server (server.cpp)
│   ├── tests/              # Unit tests (AutomataTests.cpp)
│   └── third_party/Crow/   # Crow C++ HTTP framework
├── frontend/               # Web frontend application
├── docs/                   # Documentation and project assets
└── README.md
```

## Getting Started

### Prerequisites

- C++17 compatible compiler (e.g. GCC / MinGW-w64, Clang, or MSVC)
- CMake (3.15 or newer)

### Compiling and Running Backend Server

Using MinGW / GCC on Windows:
```bash
g++ -std=c++17 backend/src/server.cpp -I backend/include -I backend/third_party/Crow/include -lws2_32 -lmswsock -o automata_server.exe
./automata_server.exe
```

Or run unit tests:
```bash
g++ -std=c++17 backend/tests/AutomataTests.cpp -I backend/include -o automata_tests.exe
./automata_tests.exe
```

