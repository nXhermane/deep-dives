#pragma once

#include <boost/json.hpp>
#include <boost/json/object.hpp>
#include <type_traits>

#include "shared/domain/Entity.hpp"

namespace Infra {
    template <typename T, typename Props>
    concept InfraAllowedClass = std::is_base_of_v<Domain::Entity<Props>, T>;
    template <typename Props, InfraAllowedClass<Props> T, typename PersistenceDto>
    class InfraMapper {
       protected:
        InfraMapper();

       public:
        ~InfraMapper() = default;
        virtual PersistenceDto toPersistence(const T &) const = 0;
        template <typename R>
        T toDomain(const R &) const;
    };
}  // namespace Infra