
#include "domain/entities/Reservation.hpp"
#include "domain/factories/ReservationFactory.hpp"
#include "shared/core/Result.hpp"
#include "shared/domain/Entity.hpp"
namespace AvancedLibrary {
    ReservationFactory::ReservationFactory() {}
    Core::Result<Reservation> ReservationFactory::create(CreateReservationProps& createProps) {
        return Core::Result<Reservation>::encapsultate<Reservation>([&createProps]() -> Reservation {
            Domain::CreateEntityProps<ReservationProps> entityProps{
                std::nullopt, std::nullopt, std::nullopt,
                ReservationProps{std::nullopt, std::nullopt, createProps.userId, createProps.userId,
                                 createProps.queuePosition, ReservationStatus::WAITING}};
            return Reservation{entityProps};
        });
    }
}  // namespace AvancedLibrary