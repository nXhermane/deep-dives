#pragma once

#include <chrono>
#include <optional>
#include <string>
#include <type_traits>
#include <variant>
namespace Domain {
    using AggregateID = std::variant<std::string, int>;

    struct BaseEntityProps {
        AggregateID id;
        std::chrono::time_point<std::chrono::system_clock> createdAt;
        std::chrono::time_point<std::chrono::system_clock> updatedAt;
    };

    template <typename T>
    class PropsWrapper {
       private:
        T props;
        std::chrono::time_point<std::chrono::system_clock>& updatedAtRef;

       public:
        explicit PropsWrapper(T initialProps, std::chrono::time_point<std::chrono::system_clock>& updatedAt);
        T& get() const;
        template <typename FieldType>
        void set(FieldType T::*field, const FieldType& newValue);
        template <typename FiedType, typename Func, typename std::enable_if<std::is_class_v<FiedType>, int>::type = 0>
        void modify(FiedType T::*field, Func func);
        const T& read() const;
    };

    template <typename T>
    struct CreateEntityProps {
        std::optional<AggregateID> id;
        std::optional<std::chrono::time_point<std::chrono::system_clock>> createdAt;
        std::optional<std::chrono::time_point<std::chrono::system_clock>> updatedAt;
        T props;
    };

    template <class T>
    class Entity {
       private:
        const AggregateID id;
        const std::chrono::time_point<std::chrono::system_clock> createdAt;
        std::chrono::time_point<std::chrono::system_clock> updatedAt;

        void validateProps(const T& newProps);

       protected:
        PropsWrapper<T> props;
        virtual void validate() const = 0;
        mutable bool _isValid = false;
        mutable bool _isDeleted = false;

       public:
        struct GetPropsResult : BaseEntityProps, T {};

        explicit Entity(CreateEntityProps<T>& entityProps);
        bool equals(const Entity<T>& entity) const;
        std::string getId() const;
        std::string getCreatedAt() const ;
        std::string getUpdatedAt() const ;

        GetPropsResult getProps() const;
        bool isValid() const;

        static bool isEntity(const void* obj);
    };

}  // namespace Domain

#include "Entity.tpp"