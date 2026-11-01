cmake_minimum_required(VERSION 3.15)
project(AutomataSimulation VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Include directories
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${CMAKE_CURRENT_SOURCE_DIR}/third_party/Crow/include
)

# 1. Main CLI Simulator
add_executable(automata_simulator
    src/main.cpp
)

# 2. REST API Server (Crow)
add_executable(automata_server
    src/server.cpp
)
set_target_properties(automata_server PROPERTIES OUTPUT_NAME "automata_api_server")

if(WIN32)
    target_link_libraries(automata_server PRIVATE ws2_32 mswsock)
elseif(UNIX AND NOT APPLE)
    target_link_libraries(automata_server PRIVATE pthread)
endif()

# 3. Unit & Integration Tests
add_executable(automata_tests
    tests/AutomataTests.cpp
)

add_executable(validation_tests
    src/validation_test.cpp
)

add_executable(string_simulation_tests
    src/StringSimulationTest.cpp
)

# Enable CTest support
enable_testing()
add_test(NAME AutomataTestSuite COMMAND automata_tests)
add_test(NAME ValidationTests COMMAND validation_tests)
