#pragma once
#include <string>
#include <type_traits>
#include <vector>

#include "shared/domain/Entity.hpp"
namespace Infra {
    template <typename T, typename Props>
    concept RepositoryAllowedClass = std::is_base_of_v<Domain::Entity<Props>, T>;
    template <typename Props, RepositoryAllowedClass<Props> T>
    class Repository {
       protected:
        Repository();

       public:
        ~Repository() = default;

        virtual void save(T&) = 0;
        virtual void remove(std::string& id) = 0;
        virtual T getById(std::string& id) const = 0;
        virtual std::vector<T> getAll() const = 0;
        virtual std::vector<std::string> getAllId() const { return std::vector<std::string>{}; }
    };
}  // namespace Infra