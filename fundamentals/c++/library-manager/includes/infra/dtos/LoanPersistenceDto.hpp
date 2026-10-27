#pragma once
#include <boost/json/object.hpp>
#include <optional>
#include <string>

#include "domain/entities/Loan.hpp"
#include "shared/core/Guard.hpp"
#include "shared/infra/JsonStoreService.hpp"

namespace AvancedLibrary {
    struct LoanPersistenceDto {
        std::string id;
        std::string createdAt;
        std::string updatedAt;
        std::string startDate;
        std::string dueDate;
        std::optional<std::string> returnDate;
        LoanStatus status;
        std::string bookId;

        Infra::Json::object toJson() const {
            return {{"id", id},
                    {"createdAt", createdAt},
                    {"updatedAt", updatedAt},
                    {"startDate", startDate},
                    {"dueDate", dueDate},
                    {"returnDate", returnDate.value_or("")},
                    {"status", static_cast<int>(status)},
                    {"bookId", bookId}};
        };

        static LoanPersistenceDto fromJson(const Infra::Json::object& obj) {
            return {obj.at("id").as_string().c_str(),
                    obj.at("createdAt").as_string().c_str(),
                    obj.at("updatedAt").as_string().c_str(),
                    obj.at("startDate").as_string().c_str(),
                    obj.at("dueDate").as_string().c_str(),
                    Core::Guard::isEmpty(obj.at("returnDate").as_string().c_str()).succeeded
                        ? std::nullopt
                        : std::make_optional(obj.at("returnDate").as_string().c_str()),
                    (LoanStatus)obj.at("status").as_int64(),
                    obj.at("bookId").as_string().c_str()
            };
        };
    };
}  // namespace AvancedLibrary