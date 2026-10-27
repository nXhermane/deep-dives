#pragma once
#include <type_traits>
#include "shared/exceptions/Exceptions.hpp"
#include "shared/core/Guard.hpp"
#include "ValueObject.hpp"

namespace Domain {

    template <typename T>
    T DomainPrimitive<T>::getValue() const {
        return _value;
    }
    template <typename T>
    bool DomainPrimitive<T>::operator==(const DomainPrimitive<T>& other) const {
        return this->_value == other._value;
    }

    template <typename T>
    ValueObject<T>::ValueObject(const ValueObjectProps<T>& props) : props(props) {
        checkIfEmpty(props);
    }
    template <typename T>
    template <typename U>
     bool ValueObject<T>::isDomainPrimitive(const U& props) {
        return false;
    }
    template <typename T>
    template <typename U>
     bool ValueObject<T>::isDomainPrimitive(const DomainPrimitive<U>& props) {
        return true;
    }
    template <typename T>
    void ValueObject<T>::checkIfEmpty(const ValueObjectProps<T>& props) const {
        if constexpr (std::is_same_v<DomainPrimitive<T>, ValueObjectProps<T>>) {
            if (Core::Guard::isEmpty(props).succeeded || Core::Guard::isEmpty(props.getValue()).succeeded) {
                throw ArgumentNotProvidedException("Property cannot be empty.");
            }
        } else {
            if (Core::Guard::isEmpty(props).succeeded) {
                throw ArgumentNotProvidedException("Property can't be empty.");
            }
        }
    }
    template <typename T>
    bool ValueObject<T>::isValid() const {
        try {
            validate(props);
            return true;
        } catch (const std::exception& e) {
            return false;
        }
    }
    template <typename T>
    bool ValueObject<T>::equals(const ValueObject<T>* vo) const {
        if (vo == nullptr) return false;
        return this->unpack() == vo->unpack();
    }
    template <typename T>
    T ValueObject<T>::unpack() const {
        if constexpr (std::is_same_v<DomainPrimitive<T>, ValueObjectProps<T>>)
            return props.getValue();
        else
            return props;
    }
    template <typename T>
    bool ValueObject<T>::isValueObject(const void* obj) {
        return dynamic_cast<const ValueObject<T>*>(obj) != obj;
    }

}  // namespace Domain
