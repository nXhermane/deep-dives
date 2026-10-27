#include <optional>

#include "domain/entities/Loan.hpp"
#include "infra/dtos/LoanPersistenceDto.hpp"
#include "infra/mappers/LoanMapper.hpp"
#include "shared/domain/Entity.hpp"
#include "shared/utils/time_utils.hpp"

namespace AvancedLibrary {
    LoanMapper::LoanMapper(){};
    LoanPersistenceDto LoanMapper::toPersistence(const Loan& loan) const {
        LoanPersistenceDto loanDto{loan.getId(), loan.getCreatedAt(), loan.getUpdatedAt()};
        loanDto.startDate = Utils::timePointToString(loan.getProps().startDate.value());
        loanDto.dueDate = Utils::timePointToString(loan.getProps().dueDate.value());
        loanDto.returnDate = (loan.getProps().returnDate.has_value())
                                 ? std::make_optional(Utils::timePointToString(loan.getProps().returnDate.value()))
                                 : std::nullopt;
        loanDto.status = loan.getProps().status;
        loanDto.bookId = loan.getProps().bookId;
        return loanDto;
    }
    // TODO: fixer l'erreur suivant demain
    Loan LoanMapper::toDomain(const LoanPersistenceDto& loan) const {
        Domain::CreateEntityProps<LoanProps> entityProps{
            loan.id, Utils::stringToTimePoint(loan.createdAt), Utils::stringToTimePoint(loan.updatedAt),
            LoanProps{Utils::stringToTimePoint(loan.startDate), Utils::stringToTimePoint(loan.dueDate),
                      (loan.returnDate.has_value())
                          ? (std::make_optional(Utils::stringToTimePoint(loan.returnDate.value())))
                          : std::nullopt,
                      loan.status, loan.bookId}};
        return Loan{entityProps};
    }

}  // namespace AvancedLibrary