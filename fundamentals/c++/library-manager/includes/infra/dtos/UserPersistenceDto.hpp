#pragma once
#include <boost/json/object.hpp>
#include <boost/json/value_from.hpp>
#include <string>
#include <vector>

#include "shared/infra/JsonStoreService.hpp"
namespace AvancedLibrary {
    struct UserPersistenceDto {
        std::string id;
        std::string createdAt;
        std::string updatedAt;
        std::string name;
        std::string username;
        std::string email;
        unsigned int maxLoan;
        std::vector<std::string> activeLoans;
        std::vector<std::string> loanHistory;
        double penalties;

        Infra::Json::object toJson() const {
            return {{"id", id},
                    {"createdAt", createdAt},
                    {"updatedAt", updatedAt},
                    {"name", name},
                    {"username", username},
                    {"email", email},
                    {"maxLoan", maxLoan},
                    {"activeLoans", Infra::Json::value_from(activeLoans)},
                    {"loanHistory", Infra::Json::value_from(loanHistory)},
                    {"penalties", penalties}};
        };

        static UserPersistenceDto fromJson(const Infra::Json::object& obj) {
            return {obj.at("id").as_string().c_str(),
                    obj.at("createdAt").as_string().c_str(),
                    obj.at("updatedAt").as_string().c_str(),
                    obj.at("name").as_string().c_str(),
                    obj.at("username").as_string().c_str(),
                    obj.at("email").as_string().c_str(),
                    (unsigned)obj.at("maxLoan").as_uint64(),
                    Infra::Json::value_to<std::vector<std::string>>(obj.at("activeLoans")),
                    Infra::Json::value_to<std::vector<std::string>>(obj.at("loanHistory")),
                    obj.at("penalties").as_double()};
        };
    };
}  // namespace AvancedLibrary