cmake_minimum_required(VERSION 3.10)
project(RyzenShieldClipboardWatcher)

set(CMAKE_CXX_STANDARD 17)

add_executable(ClipboardWatcher Watcher.cpp)

if(WIN32)
    target_link_libraries(ClipboardWatcher user32 kernel32)
endif()
