#pragma once
#include <string>

#include "shared/domain/Factory.hpp"
#include "shared/core/Result.hpp"
#include "domain/entities/Reservation.hpp"
namespace AvancedLibrary {
    struct CreateReservationProps {
        std::string userId;
        std::string bookId;
        unsigned queuePosition;
    };
    class ReservationFactory : public Core::Factory<ReservationProps, Reservation, CreateReservationProps> {
       public:
        ReservationFactory();
        Core::Result<Reservation> create(CreateReservationProps &) override;
    };
}  // namespace AvancedLibrary