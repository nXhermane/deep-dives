#include <boost/json/object.hpp>

#include "infra/dtos/ReservationPersistenceDto.hpp"
#include "infra/mappers/ReservationMapper.hpp"
#include "infra/repository/ReservationRepository.hpp"
#include "shared/infra/JsonStoreService.hpp"

namespace AvancedLibrary {

    JsonReservationRepository::JsonReservationRepository(std::string& path, ReservationMapper& mapper)
        : jsonStore(path, [this](Infra::JsonStoreService& jsonstore) -> void { saveToFileCallBack(jsonstore); }),
          mapper(mapper) {}

    void JsonReservationRepository::loadFromFile() {
        Infra::JsonArray reservationJsonArray{jsonStore.load()};
        for (const auto& reservationJsonValue : reservationJsonArray) {
            if (!reservationJsonValue.is_object())
                throw std::runtime_error("[Error] Invalid JSON format: expected an object");
            const Infra::Json::object& jsonReservation{reservationJsonValue.as_object()};
            ReservationPersistenceDto reservation{ReservationPersistenceDto::fromJson(jsonReservation)};
            store.insert({reservation.id, reservation});
        }
    }
}  // namespace AvancedLibrary