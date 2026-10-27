#pragma once
#include <boost/json/object.hpp>
#include <string>

#include "shared/infra/JsonStoreService.hpp"
namespace AvancedLibrary {
    struct ReviewPersistenceDto {
        std::string id;
        std::string createdAt;
        std::string updatedAt;
        std::string comment;
        unsigned rating;
        bool modified;
        std::string date;
        std::string userId;

        Infra::Json::object toJson() const {
            return {{"id", id},         {"createdAt", createdAt}, {"updatedAt", updatedAt}, {"comment", comment},
                    {"rating", rating}, {"modified", modified},   {"date", date},           {"userId", userId}};
        };

        static ReviewPersistenceDto fromJson(const Infra::Json::object& obj) {
            return {obj.at("id").as_string().c_str(),        obj.at("createdAt").as_string().c_str(),
                    obj.at("updatedAt").as_string().c_str(), obj.at("comment").as_string().c_str(),
                    (unsigned)obj.at("rating").as_uint64(),  obj.at("modified").as_bool(),
                    obj.at("date").as_string().c_str(),      obj.at("userId").as_string().c_str()};
        };
    };
}  // namespace AvancedLibrary