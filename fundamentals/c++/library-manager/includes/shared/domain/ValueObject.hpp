#pragma once
#include <boost/json.hpp>
#include <boost/json/object.hpp>
#include <chrono>
#include <string>
#include <type_traits>
#include <variant>

#include "shared/core/Guard.hpp"
namespace Domain {

    // Define primitive type
    using Primitive = std::variant<std::string, int, double, bool>;
    // Helpter to check if a type is a primitive
    template <typename T>
    struct IsPrimitive : std::false_type {};
    template <>
    struct IsPrimitive<std::string> : std::true_type {};
    template <>
    struct IsPrimitive<int> : std::true_type {};
    template <>
    struct IsPrimitive<double> : std::true_type {};
    template <>
    struct IsPrimitive<bool> : std::true_type {};

    // Domain Primitive value  encapsulate the base type of domain such as int , bool, char, double, float, etc.
    template <typename T>
    class DomainPrimitive {
       public:
        // If i wanna see the error at compilation , i can enable the following line
        // static_assert(std::is_arithmetic_v<T> || std::is_same_v<T, std::string>, "DomainPrimitive must be a primitive
        // type (int, double, string, char)");
        explicit DomainPrimitive(const T &value) : _value(value) {
            if (Core::Guard::isEmpty(_value).succeeded) {
                throw std::invalid_argument("The value cannot be empty.");
            }
        };
        T getValue() const;
        bool operator==(const DomainPrimitive &other) const;

       private:
        T _value;
    };

    // Type trait to determine ValueObjectProps type
    template <typename T, typename Enable = void>
    struct ValueObjectPropsType;
    // Specialization for primitive types and date
    template <typename T>
    struct ValueObjectPropsType<
        T, std::enable_if_t<IsPrimitive<T>::value || std::is_same_v<T, std::chrono::system_clock::time_point>>> {
        using type = DomainPrimitive<T>;
    };
    // Specialization for other types
    template <typename T>
    struct ValueObjectPropsType<
        T, std::enable_if_t<!IsPrimitive<T>::value && !std::is_same_v<T, std::chrono::system_clock::time_point>>> {
        using type = T;
    };

    template <typename T>
    using ValueObjectProps = typename ValueObjectPropsType<T>::type;
    template <typename T>
    class ValueObject {
       protected:
        ValueObjectProps<T> props;
        virtual void validate(const ValueObjectProps<T> &props) const = 0;
        void checkIfEmpty(const ValueObjectProps<T> &props) const;

       public:
        explicit ValueObject(const ValueObjectProps<T> &props);

        bool isValid() const;
        bool equals(const ValueObject<T> *vo) const;
        T unpack() const;
        static bool isValueObject(const void *obj);
        template <typename U>
        static bool isDomainPrimitive(const U &);
        template <typename U>
        static bool isDomainPrimitive(const DomainPrimitive<U> &obj);
        // virtual boost::json::object toJSON() const;
    };
}  // namespace Domain
#include "ValueObject.tpp"