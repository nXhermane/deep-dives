#pragma once
#include "domain/entities/Reservation.hpp"
#include "infra/dtos/ReservationPersistenceDto.hpp"
#include "shared/infra/InfraMapper.hpp"
namespace AvancedLibrary {
    class ReservationMapper : public Infra::InfraMapper<ReservationProps, Reservation, ReservationPersistenceDto> {
       public:
        ReservationMapper();
        ReservationPersistenceDto toPersistence(const Reservation &) const override;
        Reservation toDomain(const ReservationPersistenceDto &) const;
    };
}  // namespace AvancedLibrary