#pragma once
#include <string>
#include <vector>

#include "domain/entities/Reservation.hpp"
#include "infra/dtos/ReservationPersistenceDto.hpp"
#include "infra/mappers/ReservationMapper.hpp"
#include "shared/infra/JsonStoreService.hpp"
#include "shared/infra/Repository.hpp"
namespace AvancedLibrary {

    class ReservationRepository : public Infra::Repository<ReservationProps, Reservation> {
       public:
        ReservationRepository();
        void save(Reservation &) override;
        void remove(std::string &) override;
        Reservation getById(std::string &) const override;
        std::vector<Reservation> getAll() const override;
    };
    class JsonReservationRepository : public Infra::Repository<ReservationProps, Reservation> {
       private:
        bool storeChanged{false};
        std::unordered_map<std::string, ReservationPersistenceDto> store;
        Infra::JsonStoreService jsonStore;
        ReservationMapper &mapper;
        void loadFromFile();
        void saveToFileCallBack(Infra::JsonStoreService &jsonstore);

       public:
        JsonReservationRepository(std::string &, ReservationMapper &);

        void save(Reservation &) override;
        void remove(std::string &) override;
        Reservation getById(std::string &) const override;
        std::vector<Reservation> getAll() const override;
    };
}  // namespace AvancedLibrary