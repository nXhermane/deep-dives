#pragma once

#include <chrono>
#include <optional>

#include "shared/domain/Entity.hpp"
namespace AvancedLibrary {
    enum ReservationStatus { WAITING, NOTIFIED, EXPIRED, COMPLETED };
    struct ReservationProps {
        std::optional<std::chrono::time_point<std::chrono::system_clock>> reservationDate;
        std::optional<std::chrono::time_point<std::chrono::system_clock>> notificationDate;
        std::string userId;
        std::string bookId;
        unsigned queuePosition;
        ReservationStatus status;
    };
    class Reservation : public Domain::Entity<ReservationProps> {
       public:
        Reservation(Domain::CreateEntityProps<ReservationProps>& entityProps);
        void validate() const override;
        void notify();
        void expire();
        void updateQueuePosition(unsigned newPosition);
        bool isExpired();
    };
}  // namespace AvancedLibrary