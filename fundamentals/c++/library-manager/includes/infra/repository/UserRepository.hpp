#pragma once
#include <string>
#include <vector>

#include "domain/entities/User.hpp"
#include "shared/infra/Repository.hpp"
namespace AvancedLibrary {

    class UserRepository : public Infra::Repository<UserProps, User> {
       public:
        UserRepository();

        void save(User&) override;
        void remove(std::string&) override;
        User getById(std::string& id) const override;
        std::vector<User> getAll() const override;
    };
}  // namespace AvancedLibrary