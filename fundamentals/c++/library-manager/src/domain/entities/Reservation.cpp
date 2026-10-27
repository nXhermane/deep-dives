#include <chrono>
#include <optional>
#include <stdexcept>

#include "domain/entities/Reservation.hpp"
#include "shared/core/Guard.hpp"
#include "shared/domain/Entity.hpp"
namespace AvancedLibrary {
    Reservation::Reservation(Domain::CreateEntityProps<ReservationProps>& entityProps)
        : Domain::Entity<ReservationProps>(entityProps) {
        if (!props.get().reservationDate.has_value()) {
            props.modify(
                &ReservationProps::reservationDate,
                [](std::optional<std::chrono::time_point<std::chrono::system_clock>>& reservationDate) -> void {
                    reservationDate = std::chrono::system_clock::now();
                });
        }
        validate();
    }
    void Reservation::validate() const {
        _isValid = false;
        if (Core::Guard::isEmpty(props.get().bookId).succeeded) {
            throw EmptyStringExcepiton("The bookId of Reservation cannot be empty.");
        }
        if (Core::Guard::isEmpty(props.get().userId).succeeded) {
            throw EmptyStringExcepiton("The userId of Reservation cannot be empty.");
        }
        // Validation code
        _isValid = true;
    }
    void Reservation::notify() {
        if (props.get().status != WAITING)
            throw std::runtime_error("The revervation must be on Waiting State to be able to notify the user.");
        props.set(&ReservationProps::status, ReservationStatus::NOTIFIED);
        props.modify(&ReservationProps::notificationDate,
                     [](std::optional<std::chrono::time_point<std::chrono::system_clock>>& notificationDate) -> void {
                         notificationDate = std::chrono::system_clock::now();
                     });
    }
}  // namespace AvancedLibrary