#include <optional>

#include "domain/entities/User.hpp"
#include "domain/factories/UserFactory.hpp"
#include "domain/value-objects/Email.hpp"
#include "shared/core/Result.hpp"
#include "shared/domain/Entity.hpp"

namespace AvancedLibrary {
    UserFactory::UserFactory(){};
    Core::Result<User> UserFactory::create(CreateUserProps& createProps) {
        return Core::Result<User>::encapsultate<User>([&createProps]() -> User {
            Email email{createProps.email};
            Domain::CreateEntityProps<UserProps> entityProps{
                std::nullopt, std::nullopt, std::nullopt,
                UserProps{createProps.name, createProps.username, email, User::DEFAULT_MAX_LOAN, std::vector<Loan>{},
                          std::vector<Loan>{}, 0.}};
            return User{entityProps};
        });
    }
}  // namespace AvancedLibrary