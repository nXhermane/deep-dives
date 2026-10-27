#pragma once

#include <boost/uuid/random_generator.hpp>
#include <boost/uuid/uuid.hpp>
#include <boost/uuid/uuid_generators.hpp>
#include <boost/uuid/uuid_io.hpp>
#include <chrono>
#include <exception>
#include <string>
#include <type_traits>
#include <variant>

#include "Entity.hpp"
#include "shared/core/Guard.hpp"
#include "shared/exceptions/Exceptions.hpp"
#include "shared/utils/time_utils.hpp"

namespace Domain {
    static boost::uuids::random_generator uuidGenerator;
    template <typename T>
    PropsWrapper<T>::PropsWrapper(T initialProps, std::chrono::system_clock::time_point& updatedAt)
        : props(std::move(initialProps)), updatedAtRef(updatedAt) {}

    template <typename T>
    template <typename FieldType>
    void PropsWrapper<T>::set(FieldType T::*field, const FieldType& newValue) {
        if (props.*field != newValue) {
            props.*field = newValue;
            updatedAtRef = std::chrono::system_clock::now();
        }
    };
    template <typename T>
    template <typename FiealType, typename Func, typename std::enable_if<std::is_class_v<FiealType>, int>::type>
    void PropsWrapper<T>::modify(FiealType T::*field, Func func) {
        func(props.*field);
        updatedAtRef = std::chrono::system_clock::now();
    }

    template <typename T>
    T& PropsWrapper<T>::get() const {
        return props;
    };

    template <typename T>
    const T& PropsWrapper<T>::read() const {
        return props;
    };

    template <typename T>
    Entity<T>::Entity(CreateEntityProps<T>& entityProps)
        : id(entityProps.id.value_or(AggregateID(boost::uuids::to_string(uuidGenerator())))),
          createdAt(entityProps.createdAt.value_or(std::chrono::system_clock::now())),
          updatedAt((entityProps.updatedAt.value_or(std::chrono::system_clock::now()))),
          props(entityProps.props, updatedAt) {
        validateProps(entityProps.props);
    }

    template <typename T>
    void Entity<T>::validateProps(const T& newProps) {
        if constexpr (std::is_fundamental_v<T> || std::is_arithmetic_v<T>) {
            throw std::invalid_argument("Entity props should be an object, not a primitive type.");
        }
        if (Core::Guard::isEmpty(newProps).succeeded) {
            throw InvalidArgumentFormat("The props cannot be empty.");
        }
    }
    template <typename T>
    Entity<T>::GetPropsResult Entity<T>::getProps() const {
        GetPropsResult result = {id, createdAt, updatedAt, props.read()};
        return result;
    }
    template <typename T>
    bool Entity<T>::equals(const Entity<T>& entity) const {
        return this->getId() == entity.getId();
    }

    template <typename T>
    std::string Entity<T>::getId() const {
        return std::visit(
            [](auto&& value) -> std::string {
                if constexpr (std::is_same_v<std::decay_t<decltype(value)>, std::string>) {
                    return value;
                } else {
                    return std::to_string(value);
                }
            },
            id);
    }
    template <typename T>
    std::string Entity<T>::getCreatedAt() const {
        return Utils::timePointToString(getProps().createdAt);
    }
    template <typename T>
    std::string Entity<T>::getUpdatedAt() const {
        return Utils::timePointToString(getProps().updatedAt);
    }
    template <typename T>
    bool Entity<T>::isValid() const {
        try {
            validate();
            return true;
        } catch (const std::exception& e) {
            return false;
        }
    }
    template <typename T>
    bool Entity<T>::isEntity(const void* obj) {
        return dynamic_cast<const Entity<T>*>(obj) != nullptr;
    }

}  // namespace Domain