#pragma once
#include <string>

#include "Guard.hpp"
namespace Core {

    template <typename T>
    GuardResponse Guard::isEmpty(const T &value) {
        // Verification des types primitifs
        if constexpr (std::is_same_v<T, std::string>) {
            return GuardResponse{value.empty(), "String is empty"};
        } else if constexpr (std::is_arithmetic_v<T>) {
            return {false, "Numeric value is never empty."};
        } else if constexpr (std::is_pointer_v<T>) {
            return {value == nullptr, "Pointer is null"};
        }
        // Detection des conteneurs STL et autres classes avec la methode empty()
        else if constexpr (requires { value.empty(); }) {
            return {value.empty(), "Container is empty"};
        }
        // Detection des structures optionnelles
        else if constexpr (requires { value.size(); }) {
            return {value.size() == 0, "Container has zero size"};
        } else if constexpr (requires { value.has_value(); }) {
            return {!value.has_value(), "Optional has no value"};
        }
        // Cas par defaut - traite les objets complexes qui n'ont pas de notion "vide"
        else {
            return {false, {}};
        };
    }
    template <typename T>
    GuardResponse Guard::inRange(const T &value, const T &min, const T &max) {
        bool isInRange = value >= min && value <= max;
        if (!isInRange)
            return {false, {"The value out of range."}};
        else
            return {true, {}};
    }

}  // namespace Core
