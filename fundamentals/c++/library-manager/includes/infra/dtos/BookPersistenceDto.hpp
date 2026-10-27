#pragma once
#include <boost/json/fwd.hpp>
#include <boost/json/object.hpp>
#include <string>
#include <vector>

#include "domain/entities/Book.hpp"
#include "shared/infra/JsonStoreService.hpp"
namespace AvancedLibrary {
    struct BookPersistenceDto {
        std::string id;
        std::string createdAt;
        std::string updatedAt;
        std::string isbn;
        std::string title;
        std::string author;
        unsigned int year;
        BookStatus status;
        std::vector<std::string> categories;
        std::vector<std::string> reviewIds;

        Infra::Json::object toJson() const {
            return {{"id", id},
                    {"createdAt", createdAt},
                    {"updatedAt", updatedAt},
                    {"isbn", isbn},
                    {"author", author},
                    {"year", year},
                    {"staus", static_cast<int>(status)},
                    {"cateorires", Infra::Json::value_from(categories)},
                    {"reviewIds", Infra::Json::value_from(reviewIds)}};
        }
        static BookPersistenceDto formJson(const Infra::Json::object& obj) {
            return {obj.at("id").as_string().c_str(),
                    obj.at("createdAt").as_string().c_str(),
                    obj.at("updatedAt").as_string().c_str(),
                    obj.at("isbn").as_string().c_str(),
                    obj.at("title").as_string().c_str(),
                    obj.at("author").as_string().c_str(),
                    (unsigned)obj.at("year").as_uint64(),
                    (BookStatus)obj.at("status").as_uint64(),
                    Infra::Json::value_to<std::vector<std::string>>(obj.at("categories")),
                    Infra::Json::value_to<std::vector<std::string>>(obj.at("reviewIds"))

            };
        }
    };
}  // namespace AvancedLibrary