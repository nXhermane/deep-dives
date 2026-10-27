#include "domain/entities/Reservation.hpp"
#include "infra/mappers/ReservationMapper.hpp"
#include "shared/utils/time_utils.hpp"
namespace AvancedLibrary {
    ReservationMapper::ReservationMapper() {}

    ReservationPersistenceDto ReservationMapper::toPersistence(const Reservation& reservation) const {
        ReservationPersistenceDto reservationDto{
            reservation.getId(),
            reservation.getCreatedAt(),
            reservation.getUpdatedAt(),
            Utils::timePointToString(reservation.getProps().reservationDate.value()),
            Utils::timePointToString(reservation.getProps().notificationDate.value()),
            reservation.getProps().userId,
            reservation.getProps().bookId,
            reservation.getProps().queuePosition,
            reservation.getProps().status};
        return reservationDto;
    }

    Reservation ReservationMapper::toDomain(const ReservationPersistenceDto& reservation) const {
        Domain::CreateEntityProps<ReservationProps> entityProps{
            reservation.id, Utils::stringToTimePoint(reservation.createdAt),
            Utils::stringToTimePoint(reservation.updatedAt),
            ReservationProps{Utils::stringToTimePoint(reservation.reservationDate),
                             Utils::stringToTimePoint(reservation.notificationDate), reservation.userId,
                             reservation.bookId, reservation.queuePosition, reservation.status}};
        return Reservation{entityProps};
    }
}  // namespace AvancedLibrary