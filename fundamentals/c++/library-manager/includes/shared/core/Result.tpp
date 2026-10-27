#pragma once
#include <exception>
#include <stdexcept>

#include "Result.hpp"

namespace Core {
    template <typename T>
    Result<T>::Result(bool isSuccess, std::optional<std::variant<T, std::string>> &error, std::optional<T> &value) {
        if (isSuccess && error.has_value()) {
            throw std::invalid_argument("InvalidOperation: A result cannot be successful and contain an error");
        }
        if (!isSuccess && !error.has_value()) {
            throw std::invalid_argument("InvalidOperation: A failing result needs to contain an error message");
        }
        this->isSuccess = isSuccess;
        this->isFailure = !isSuccess;
        this->error = error.value_or("");
        this->_value = value.value();
    }
    template <typename T>
    T Result<T>::val() const {
        if (!isSuccess) throw std::runtime_error("Can't get the value of an error result. Use 'err' instead.");
        return this->_value;
    }
    template <typename T>
    std::variant<T, std::string> Result<T>::err() const {
        return this->error;
    };

    // Static
    template <typename T>
    template <typename U>
    const Result<U> Result<T>::ok(std::optional<U> value) {
        return Result<U>{true, std::nullopt, value};
    };

    template <typename T>
    template <typename U>
    const Result<U> Result<T>::fail(std::string &error) {
        return Result<U>{false, error};
    };

    template <typename T>
    template <typename U>
    Result<U> Result<T>::combine(std::vector<Result<U>> &results) {
        for (Result<U> &result : results) {
            if (result.isFailure) return result;
        }
        return Result::ok();
    };

    template <typename T>
    template <typename U>
    Result<U> Result<T>::encapsultate(std::function<U()> func) {
        try {
            U result = func();
            return Result::ok<U>(result);
        } catch (std::exception &e) {
            return Result::fail(e.what());
        }
    }

}  // namespace Core