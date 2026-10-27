#pragma once

#include <functional>
#include <optional>
#include <string>
#include <variant>
#include <vector>
namespace Core {
    template <typename T>
    class Result {
       private:
        const std::variant<T, std::string> error;
        const T _value;

       public:
        // Property
        const bool isSuccess;
        const bool isFailure;
        // Mehtods
        Result(bool isSuccess, std::optional<std::variant<T, std::string>> &error, std::optional<T> &value);

        T val() const;
        std::variant<T, std::string> err() const;

        // Static
        template <typename U>
        static const Result<U> ok(std::optional<U> value);
        template <typename U>
        static const Result<U> fail(std::string &error);
        template <typename U>
        static Result<U> combine(std::vector<Result<U>> &results);

        template <typename U>
        static Result<U> encapsultate(std::function<U()> func);
    };
}  // namespace Core

#include "Result.tpp"