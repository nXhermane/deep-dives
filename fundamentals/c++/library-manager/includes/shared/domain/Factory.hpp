#pragma once

#include "Entity.hpp"
#include "shared/core/Result.hpp"
namespace Core {
    template <typename T, typename Props>
    concept AllowedClass = std::is_base_of_v<Domain::Entity<Props>, T>;
    template <typename Props, AllowedClass<Props> T, typename CreateProps>
    class Factory {
       protected:
        Factory();

       public:
        virtual Result<T> create(CreateProps &createProps);
    };
}  // namespace Core