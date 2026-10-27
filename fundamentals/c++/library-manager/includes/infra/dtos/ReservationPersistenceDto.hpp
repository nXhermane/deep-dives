#pragma once
#include <boost/json/object.hpp>
#include <string>

#include "domain/entities/Reservation.hpp"
#include "shared/infra/JsonStoreService.hpp"
namespace AvancedLibrary {
    struct ReservationPersistenceDto {
        std::string id;
        std::string createdAt;
        std::string updatedAt;
        std::string reservationDate;
        std::string notificationDate;
        std::string userId;
        std::string bookId;
        unsigned queuePosition;
        ReservationStatus status;

        Infra::Json::object toJson() const {
            return {{"id", id},
                    {"createdAt", createdAt},
                    {"updatedAt", updatedAt},
                    {"reservationDate", reservationDate},
                    {"notificationDate", notificationDate},
                    {"userId", userId},
                    {"bookId", bookId},
                    {"queuePosition", queuePosition},
                    {"status", (int)status}};
        };
        static ReservationPersistenceDto fromJson(const Infra::Json::object& obj) {
            return {obj.at("id").as_string().c_str(),
                    obj.at("createdAt").as_string().c_str(),
                    obj.at("updatedAt").as_string().c_str(),
                    obj.at("reservationDate").as_string().c_str(),
                    obj.at("notificationDate").as_string().c_str(),
                    obj.at("userId").as_string().c_str(),
                    obj.at("bookId").as_string().c_str(),
                    (unsigned)obj.at("queuReservationPersistenceDtoePosition").as_uint64(),
                    (ReservationStatus)obj.at("status").as_int64()};
        };
    };
}  // namespace AvancedLibrary