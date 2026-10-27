#include <boost/json/object.hpp>
#include <iostream>
#include <stdexcept>

#include "infra/dtos/LoanPersistenceDto.hpp"
#include "infra/mappers/LoanMapper.hpp"
#include "infra/repository/LoanRepository.hpp"
#include "shared/infra/JsonStoreService.hpp"

namespace AvancedLibrary {
    JsonLoanRepository::JsonLoanRepository(std::string &path, LoanMapper &mapper)
        : jsonStore(path, [this](Infra::JsonStoreService &jsonstore) -> void { saveToFileCallBack(jsonstore); }),
          mapper(mapper) {
        loadFromFile();
    }
    void JsonLoanRepository::loadFromFile() {
        Infra::JsonArray loanJsonArray{jsonStore.load()};
        for (const auto &jsonLoanValue : loanJsonArray) {
            if (!jsonLoanValue.is_object()) throw std::runtime_error("[Error] Invalid JSON format: expected an object");
            const Infra::Json::object &jsonLoan{jsonLoanValue.as_object()};
            LoanPersistenceDto loan{LoanPersistenceDto::fromJson(jsonLoan)};
            store.insert({loan.id, loan});
        }
    }
    void JsonLoanRepository::saveToFileCallBack(Infra::JsonStoreService &jsonstore) {
        if (!storeChanged) return;
        Infra::JsonArray loanJsonArray;
        for (auto &book : store) {
            loanJsonArray.push_back(book.second.toJson());
        };
        std::cout << "saveToFileCallBack" << std::endl;
        jsonstore.save(loanJsonArray);
        storeChanged = false;
    }
    void JsonLoanRepository::save(Loan &loan) {
        LoanPersistenceDto loanDto{mapper.toPersistence(loan)};
        auto it = store.find(loanDto.id);
        if (it != store.end())
            it->second = loanDto;
        else
            store.insert({loanDto.id, loanDto});
        storeChanged = true;
    }

    void JsonLoanRepository::remove(std::string& id) {
        auto it= store.find(id);
        if(it !=store.end()) {
            store.erase(id);
            storeChanged = true;
        }
    }

    Loan JsonLoanRepository::getById(std::string & id) const {
        auto it = store.find(id);
        if(it != store.end()) {
            return mapper.toDomain(it->second);
        }else {
            throw std::runtime_error("The loan with id " + id+ "not found.");
        }
    }

}  // namespace AvancedLibrary