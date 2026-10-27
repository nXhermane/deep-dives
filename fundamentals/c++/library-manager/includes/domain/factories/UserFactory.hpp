#pragma once
#include <string>

#include "shared/domain/Factory.hpp"
#include "shared/core/Result.hpp"
#include "domain/entities/User.hpp"
namespace AvancedLibrary {
    struct CreateUserProps {
        std::string name;
        std::string username;
        std::string email;
    };

    class UserFactory : public Core::Factory<UserProps, User, CreateUserProps> {
       public:
        UserFactory();
        Core::Result<User> create(CreateUserProps& createProps) override;
    };
}  // namespace AvancedLibrary