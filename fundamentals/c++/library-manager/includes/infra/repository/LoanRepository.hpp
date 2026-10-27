#pragma once
#include <string>
#include <unordered_map>
#include <vector>

#include "domain/entities/Loan.hpp"
#include "infra/dtos/LoanPersistenceDto.hpp"
#include "infra/mappers/LoanMapper.hpp"
#include "shared/infra/JsonStoreService.hpp"
#include "shared/infra/Repository.hpp"
namespace AvancedLibrary {
    class LoanRepository : public Infra::Repository<LoanProps, Loan> {
       public:
        LoanRepository();

        void save(Loan &) override;
        void remove(std::string &) override;
        Loan getById(std::string &id) const override;
        std::vector<Loan> getAll() const override;
    };
    class JsonLoanRepository : public Infra::Repository<LoanProps, Loan> {
       private:
        bool storeChanged{false};
        std::unordered_map<std::string, LoanPersistenceDto> store;
        Infra::JsonStoreService jsonStore;
        LoanMapper &mapper;
        void loadFromFile();
        void saveToFileCallBack(Infra::JsonStoreService &jsonstore);

       public:
        JsonLoanRepository(std::string &, LoanMapper &);
        
        void save(Loan &) override;
        void remove(std::string &id) override;
        Loan getById(std::string &id) const override;
    };

}  // namespace AvancedLibrary